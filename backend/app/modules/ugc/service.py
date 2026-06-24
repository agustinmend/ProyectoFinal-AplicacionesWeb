import uuid
from typing import List, Optional
from sqlalchemy.orm import Session
from sqlalchemy import select, or_
from .models import Favorite
from modules.catalog.models import TShirt
from modules.catalog.service import search_tshirts_in_es

def toggle_favorite(db: Session, user_id: uuid.UUID, t_shirt_id: uuid.UUID) -> bool:
    stmt = select(Favorite).where(
        Favorite.user_id == user_id,
        Favorite.t_shirt_id == t_shirt_id
    )
    favorite = db.execute(stmt).scalar_one_or_none()
    if favorite:
        db.delete(favorite)
        db.commit()
        return False
    else:
        new_fav = Favorite(
            id=uuid.uuid4(),
            user_id=user_id,
            t_shirt_id=t_shirt_id
        )
        db.add(new_fav)
        db.commit()
        return True

def get_user_favorites(db: Session, user_id: uuid.UUID, search: Optional[str] = None) -> List[TShirt]:
    # Obtener los IDs de las poleras favoritas del usuario
    stmt_fav_ids = select(Favorite.t_shirt_id).where(Favorite.user_id == user_id)
    favorite_tshirt_ids = db.execute(stmt_fav_ids).scalars().all()
    
    if not favorite_tshirt_ids:
        return []

    # Convertir IDs a string para compararlos con los de Elasticsearch
    fav_ids_str = {str(uid) for uid in favorite_tshirt_ids}

    # Si hay un término de búsqueda, intentar usar Elasticsearch
    if search and search.strip():
        matching_ids = search_tshirts_in_es(search)
        if matching_ids is not None:
            # Filtrar los IDs devueltos por ES que pertenecen a los favoritos del usuario
            valid_ids = [uid for uid in matching_ids if uid in fav_ids_str]
            if not valid_ids:
                return []
            
            stmt = select(TShirt).where(TShirt.id.in_([uuid.UUID(uid) for uid in valid_ids]))
            tshirts = db.execute(stmt).scalars().all()
            
            # Mantener el orden de relevancia devuelto por ES
            id_to_tshirt = {str(t.id): t for t in tshirts}
            return [id_to_tshirt[uid] for uid in valid_ids if uid in id_to_tshirt]

        # Fallback de búsqueda ILIKE en DB local
        stmt = select(TShirt).where(
            TShirt.id.in_(favorite_tshirt_ids),
            TShirt.is_active == True,
            or_(
                TShirt.name.ilike(f"%{search}%"),
                TShirt.description.ilike(f"%{search}%")
            )
        )
        return db.execute(stmt).scalars().all()

    # Si no hay término de búsqueda, retornar todas
    stmt = select(TShirt).where(TShirt.id.in_(favorite_tshirt_ids))
    return db.execute(stmt).scalars().all()
