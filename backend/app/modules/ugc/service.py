import uuid
from typing import List, Optional
from sqlalchemy.orm import Session
from sqlalchemy import select, or_
from .models import Favorite
from modules.catalog.models import PresetDesign

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

def get_user_favorites(db: Session, user_id: uuid.UUID, search: Optional[str] = None) -> List[PresetDesign]:
    stmt_fav_ids = select(Favorite.t_shirt_id).where(Favorite.user_id == user_id)
    favorite_tshirt_ids = db.execute(stmt_fav_ids).scalars().all()
    
    if not favorite_tshirt_ids:
        return []

    if search and search.strip():
        stmt = select(PresetDesign).where(
            PresetDesign.id.in_(favorite_tshirt_ids),
            PresetDesign.is_active == True,
            PresetDesign.name.ilike(f"%{search}%")
        )
        return db.execute(stmt).scalars().all()

    stmt = select(PresetDesign).where(
        PresetDesign.id.in_(favorite_tshirt_ids),
        PresetDesign.is_active == True
    )
    return db.execute(stmt).scalars().all()

