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
