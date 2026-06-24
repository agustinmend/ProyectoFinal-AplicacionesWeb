from fastapi import APIRouter, status
from .schemas import CotizacionRequest, CotizacionResponse
from . import service

router = APIRouter(prefix="/negocio", tags=["Negocio"])

@router.post("/cotizaciones", response_model=CotizacionResponse, status_code=status.HTTP_200_OK)
def create_cotizacion(data: CotizacionRequest):
    result = service.generate_whatsapp_quotation(data)
    return CotizacionResponse(
        whatsapp_url=result["whatsapp_url"],
        formatted_message=result["formatted_message"]
    )
