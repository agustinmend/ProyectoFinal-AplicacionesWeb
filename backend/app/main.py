from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from shared.init_db import init_db
from modules.auth.router import router as auth_router
from modules.negocio.router import router as negocio_router
from modules.catalog.router import router as catalog_router

app = FastAPI(
    title="Plataforma de personalización de poleras",
    version="1.0.0",
)

# Configurar middleware de CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # En producción, restringir a los dominios del frontend
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router)
app.include_router(negocio_router)
app.include_router(catalog_router)


@app.on_event("startup")
def on_startup():
    # Inicializar esquemas y tablas
    init_db()
    
    from shared.database import SessionLocal
    db = SessionLocal()
    
    # Crear usuario invitado por defecto si no existe
    try:
        from modules.auth.models import User
        import uuid
        guest_id = uuid.UUID("00000000-0000-0000-0000-000000000000")
        guest_user = db.query(User).filter(User.id == guest_id).first()
        if not guest_user:
            guest_user = User(
                id=guest_id,
                email="guest@poleras.bo",
                password_hash=None,
                full_name="Cliente Invitado",
                role="cliente",
                is_active=True
            )
            db.add(guest_user)
            db.commit()
            print("Usuario invitado creado exitosamente.")
    except Exception as e:
        print(f"Error al crear usuario invitado: {e}")
    
    # Sincronizar catálogo con Elasticsearch
    from modules.catalog.service import sync_catalog_to_es
    try:
        sync_catalog_to_es(db)
    finally:
        db.close()


@app.get("/health")
def health():
    return {"status": "ok"}