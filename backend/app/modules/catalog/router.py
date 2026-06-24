from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List, Optional
from uuid import UUID
from shared.database import get_db
from .schemas import CategoryResponse, TShirtResponse
from .models import Category
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
    tshirts = ugc_service.get_user_favorites(db, user_id, search=search)
    return tshirts
