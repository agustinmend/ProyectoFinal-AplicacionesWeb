from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from shared.init_db import init_db
from modules.auth.router import router as auth_router
from modules.negocio.router import router as negocio_router
from modules.catalog.router import router as catalog_router
from modules.admin.router import router as admin_router

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

app.include_router(admin_router)
app.include_router(auth_router)
app.include_router(negocio_router)
app.include_router(catalog_router)


@app.on_event("startup")
def on_startup():
    # Inicializar esquemas y tablas
    init_db()
    
    # Sincronizar catálogo con Elasticsearch
    from shared.database import SessionLocal
    from modules.catalog.service import sync_catalog_to_es
    db = SessionLocal()
    try:
        sync_catalog_to_es(db)
    finally:
        db.close()


@app.get("/health")
def health():
    return {"status": "ok"}