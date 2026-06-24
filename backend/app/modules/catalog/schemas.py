from pydantic import BaseModel, Field, model_validator
from uuid import UUID
from typing import Optional

class CategoryResponse(BaseModel):
    id: UUID
    name: str
    slug: str
    is_active: bool

    class Config:
        from_attributes = True

class TShirtResponse(BaseModel):
    id: UUID
    categoryid: UUID = Field(validation_alias="category_id", serialization_alias="categoryid")
    name: str
    description: str
    material: str
    base_price: str
    is_active: bool
    image_url: str

    class Config:
        from_attributes = True
        populate_by_name = True

    @model_validator(mode="before")
    @classmethod
    def convert_fields(cls, data):
        # Si es un objeto de base de datos SQLAlchemy
        if not isinstance(data, dict) and hasattr(data, "base_price"):
            # Encontrar imagen principal o usar el placeholder por defecto
            primary_img = None
            if hasattr(data, "images") and data.images:
                for img in data.images:
                    if img.is_primary:
                        primary_img = img.image
                        break
                if not primary_img:
                    primary_img = data.images[0].image

            if primary_img:
                image_url = f"http://localhost:8000/media/{primary_img}"
            else:
                image_url = "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=500&auto=format&fit=crop&q=80"

            return {
                "id": data.id,
                "category_id": data.category_id,
                "name": data.name,
                "description": data.description or "",
                "material": data.material or "",
                "base_price": str(data.base_price),
                "is_active": data.is_active,
                "image_url": image_url
            }
        return data
