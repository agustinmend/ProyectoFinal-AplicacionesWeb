import os
import urllib.parse
from sqlalchemy.orm import Session
from sqlalchemy import select, or_
from .schemas import CotizacionRequest
from .schemas import CotizacionPoleraPersonalizada
from .models import QuoteConfig

def generate_whatsapp_quotation(data: CotizacionRequest) -> dict:
    whatsapp_number = os.environ.get("WHATSAPP_NUMBER", "59162074399")
    
    # Construcción del mensaje
    lines = ["¡Hola! Me gustaría realizar una cotización para las siguientes poleras:\n"]
    
    total = 0.0
    for item in data.items:
        item_total = item.price * item.quantity
        total += item_total
        item_line = (
            f"• *{item.quantity}x {item.name}* (Talla: {item.size}, Color: {item.color}) "
            f"— BOB {item.price:.2f} c/u (Subtotal: BOB {item_total:.2f})"
        )
        if item.description:
            item_line += f"\n  - Detalle: {item.description}"
        if item.image_url:
            item_line += f"\n  - Imagen del diseño: {item.image_url}"
        lines.append(item_line)
        
    lines.append(f"\n*Total aproximado:* BOB {total:.2f}")
    lines.append("\nQuedo atento para coordinar el pago y el envío. ¡Muchas gracias!")
    
    message = "\n".join(lines)
    
    # Codificar mensaje para la URL
    encoded_message = urllib.parse.quote(message)
    whatsapp_url = f"https://wa.me/{whatsapp_number}?text={encoded_message}"
    
    return {
        "whatsapp_url": whatsapp_url,
        "formatted_message": message
    }

def generar_cotizacion(db: Session, data: CotizacionPoleraPersonalizada) -> float:
    total_price = data.base_price
    query = select(QuoteConfig).where(QuoteConfig.label == data.posicion).scalar_one_or_none()
    config = db.execute(query)
    return total_price + config.extra_cost
