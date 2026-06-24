from fastapi import FastAPI
from modules.auth.router import router as auth_router

app = FastAPI(
    title="Plataforma de personalización de poleras",
    version="1.0.0",
)

app.include_router(auth_router)

@app.get("/health")
def health():
    return {"status": "ok"}