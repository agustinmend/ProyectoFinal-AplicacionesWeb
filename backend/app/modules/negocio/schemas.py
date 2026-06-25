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
    description: str | None = None


class CotizacionRequest(BaseModel):
    items: List[CartItemInput]

class CotizacionResponse(BaseModel):
    whatsapp_url: str
    formatted_message: str

class CotizacionPoleraPersonalizada(BaseModel):
    base_price: float
    size: str
    posicion: str
    tamano: str
    color: str