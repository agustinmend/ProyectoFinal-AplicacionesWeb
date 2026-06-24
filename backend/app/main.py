from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from shared.init_db import init_db
from modules.auth.router import router as auth_router
from modules.negocio.router import router as negocio_router

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


@app.on_event("startup")
def on_startup():
    init_db()


@app.get("/health")
def health():
    return {"status": "ok"}