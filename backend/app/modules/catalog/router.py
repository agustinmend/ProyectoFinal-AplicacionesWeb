from fastapi import APIRouter, Depends, UploadFile, File, HTTPException
import os
from sqlalchemy.orm import Session
from typing import List, Optional
from uuid import UUID
from shared.database import get_db
from .schemas import CategoryResponse, TShirtResponse, PresetDesignResponse
from .models import Category, PresetDesign
from . import service

router = APIRouter(prefix="/catalog", tags=["Catalog"])

@router.get("/categories", response_model=List[CategoryResponse])
def get_categories(db: Session = Depends(get_db)):
    from sqlalchemy import select
    stmt = select(Category).where(Category.is_active == True)
    return db.execute(stmt).scalars().all()

@router.get("/tshirts", response_model=List[TShirtResponse], response_model_by_alias=True)
def get_tshirts(
    category_id: Optional[UUID] = None,
    search: Optional[str] = None,
    db: Session = Depends(get_db)
):
    tshirts = service.get_tshirts_from_db(db, category_id=category_id, search=search)
    return tshirts

# Seguridad y dependencias para favoritos
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
bearer_scheme = HTTPBearer(auto_error=False)

def get_current_user_id(credentials: Optional[HTTPAuthorizationCredentials] = Depends(bearer_scheme)) -> UUID:
    if credentials:
        try:
            from modules.auth import service as auth_service
            payload = auth_service.decode_access_token(credentials.credentials)
            return UUID(payload["sub"])
        except Exception:
            pass
    # Fallback al usuario invitado
    return UUID("00000000-0000-0000-0000-000000000000")

@router.post("/favorites/toggle/{tshirt_id}")
def toggle_favorite_endpoint(
    tshirt_id: UUID,
    db: Session = Depends(get_db),
    user_id: UUID = Depends(get_current_user_id)
):
    from modules.ugc import service as ugc_service
    favorited = ugc_service.toggle_favorite(db, user_id, tshirt_id)
    return {"favorited": favorited}

@router.get("/favorites", response_model=List[TShirtResponse], response_model_by_alias=True)
def get_favorites_endpoint(
    search: Optional[str] = None,
    db: Session = Depends(get_db),
    user_id: UUID = Depends(get_current_user_id)
):
    from modules.ugc import service as ugc_service
    from .schemas import PresetDesignResponse
    designs = ugc_service.get_user_favorites(db, user_id, search=search)
    result = []
    for d in designs:
        d_data = PresetDesignResponse.model_validate(d)
        result.append({
            "id": d_data.id,
            "categoryid": UUID("11111111-0000-0000-0000-000000000001"),
            "name": d_data.name,
            "description": "Diseño exclusivo estampado de alta calidad.",
            "material": "Algodón",
            "base_price": "99.00",
            "is_active": d_data.is_active,
            "image_url": d_data.image_url
        })
    return result

@router.get("/preset-designs", response_model=List[PresetDesignResponse])
def get_preset_designs(db: Session = Depends(get_db)):
    from sqlalchemy import select
    stmt = select(PresetDesign).where(PresetDesign.is_active == True)
    return db.execute(stmt).scalars().all()

@router.post("/upload-design")
def upload_design(
    file: UploadFile = File(...)
):
    import shutil
    import uuid
    # Validar formato
    ext = os.path.splitext(file.filename)[1].lower()
    if ext not in [".png", ".jpg", ".jpeg"]:
        raise HTTPException(status_code=400, detail="Formato no válido. Debe ser PNG o JPG.")
    
    # Directorio estático
    static_dir = "/app/static/custom_designs"
    os.makedirs(static_dir, exist_ok=True)
    
    # Nombre de archivo único
    filename = f"{uuid.uuid4()}{ext}"
    filepath = os.path.join(static_dir, filename)
    
    # Guardar
    with open(filepath, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
        
    return {"image_url": f"http://localhost:8001/static/custom_designs/{filename}"}
