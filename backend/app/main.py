from fastapi import FastAPI
from shared.init_db import init_db
from modules.auth.router import router as auth_router

app = FastAPI(
    title="Plataforma de personalización de poleras",
    version="1.0.0",
)

app.include_router(auth_router)


@app.on_event("startup")
def on_startup():
    init_db()


@app.get("/health")
def health():
    return {"status": "ok"}