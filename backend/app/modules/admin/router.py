from fastapi import APIRouter, Depends
from modules.auth.dependencies import RoleChecker

# Este router completo estará protegido, solo 'administrador' puede entrar
router = APIRouter(
    prefix="/admin", 
    tags=["Admin"],
    dependencies=[Depends(RoleChecker(["administrador"]))]
)

@router.post("/productos")
def crear_producto():
    # Lógica para crear producto (HU-15)
    pass