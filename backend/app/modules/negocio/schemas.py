from pydantic import BaseModel
from typing import List

class CartItemInput(BaseModel):
    tshirt_id: str
    name: str
    size: str
    color: str
    quantity: int
    price: float
    image_url: str | None = None


class CotizacionRequest(BaseModel):
    items: List[CartItemInput]

class CotizacionResponse(BaseModel):
    whatsapp_url: str
    formatted_message: str
