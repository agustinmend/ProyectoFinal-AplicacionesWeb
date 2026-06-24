import os
import time
from elasticsearch import Elasticsearch
from sqlalchemy.orm import Session
from sqlalchemy import select, or_
from .models import TShirt

es_client = None

def get_es_client():
    global es_client
    if es_client is None:
        es_url = os.environ.get("ELASTICSEARCH_URL", "http://elasticsearch:9200")
        es_client = Elasticsearch(es_url)
    return es_client

def sync_catalog_to_es(db: Session):
    es = get_es_client()
    connected = False
    
    # Esperar a que Elasticsearch esté disponible (hasta 10 intentos)
    for i in range(10):
        try:
            if es.ping():
                connected = True
                break
        except Exception:
            pass
        print(f"Esperando a Elasticsearch... (Intento {i+1}/10)")
        time.sleep(3)
        
    if not connected:
        print("⚠️ No se pudo conectar a Elasticsearch. La búsqueda directa en base de datos será usada como fallback.")
        return

    try:
        # Crear el índice de poleras si no existe
        if not es.indices.exists(index="tshirts"):
            es.indices.create(index="tshirts")

        # Obtener todas las poleras activas de PostgreSQL
        tshirts = db.execute(select(TShirt).where(TShirt.is_active == True)).scalars().all()
        
        for tshirt in tshirts:
            doc = {
                "id": str(tshirt.id),
                "category_id": str(tshirt.category_id),
                "name": tshirt.name,
                "description": tshirt.description or "",
                "base_price": float(tshirt.base_price),
                "is_active": tshirt.is_active
            }
            es.index(index="tshirts", id=str(tshirt.id), document=doc)
        
        print(f"Sincronización exitosa: {len(tshirts)} poleras indexadas en Elasticsearch.")
    except Exception as e:
        print(f"⚠️ Error durante la sincronización a Elasticsearch: {e}")

def search_tshirts_in_es(search_query: str, category_id: str = None) -> list:
    """
    Busca poleras en Elasticsearch y devuelve una lista de IDs coincidentes.
    Devuelve None si Elasticsearch no está disponible o falla.
    """
    es = get_es_client()
    try:
        if not es.ping():
            return None
    except Exception:
        return None

    # Query multi_match con fuzziness para tolerancia a errores ortográficos
    must_queries = [
        {
            "multi_match": {
                "query": search_query,
                "fields": ["name^2", "description"],
                "fuzziness": "AUTO"
            }
        }
    ]
    
    filter_queries = [
        {"term": {"is_active": True}}
    ]
    
    if category_id:
        filter_queries.append({"term": {"category_id": str(category_id)}})
        
    body = {
        "query": {
            "bool": {
                "must": must_queries,
                "filter": filter_queries
            }
        },
        "size": 100
    }
    
    try:
        res = es.search(index="tshirts", body=body)
        hits = res["hits"]["hits"]
        return [hit["_source"]["id"] for hit in hits]
    except Exception as e:
        print(f"Error al realizar búsqueda en Elasticsearch: {e}")
        return None

def get_tshirts_from_db(db: Session, category_id: str = None, search: str = None) -> list:
    """
    Obtiene poleras consultando a Elasticsearch si hay un término de búsqueda,
    o directamente a PostgreSQL (fallback).
    """
    from sqlalchemy import select
    
    # Si hay término de búsqueda, intentar usar Elasticsearch
    if search and search.strip():
        matching_ids = search_tshirts_in_es(search, category_id)
        if matching_ids is not None:
            if not matching_ids:
                return [] # Coincidencia vacía en ES
            
            # Obtener los registros de la DB que coinciden con los IDs ordenados
            stmt = select(TShirt).where(TShirt.id.in_(matching_ids))
            tshirts = db.execute(stmt).scalars().all()
            
            # Mantener el orden de relevancia devuelto por Elasticsearch
            id_to_tshirt = {str(t.id): t for t in tshirts}
            ordered_tshirts = [id_to_tshirt[uid] for uid in matching_ids if uid in id_to_tshirt]
            return ordered_tshirts

        # Fallback si Elasticsearch falla o no está disponible: Búsqueda SQL ILIKE
        print("Utilizando fallback de búsqueda en PostgreSQL...")
        stmt = select(TShirt).where(
            TShirt.is_active == True,
            or_(
                TShirt.name.ilike(f"%{search}%"),
                TShirt.description.ilike(f"%{search}%")
            )
        )
        if category_id:
            stmt = stmt.where(TShirt.category_id == category_id)
        return db.execute(stmt).scalars().all()

    # Si no hay término de búsqueda, obtener todas
    stmt = select(TShirt).where(TShirt.is_active == True)
    if category_id:
        stmt = stmt.where(TShirt.category_id == category_id)
    return db.execute(stmt).scalars().all()
