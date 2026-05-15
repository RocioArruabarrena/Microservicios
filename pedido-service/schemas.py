from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime

class Producto(BaseModel):
    nombre: str
    cantidad: int = Field(..., gt=0)
    precio: float = Field(..., gt=0)

class PedidoCreate(BaseModel):
    usuarioId: int
    productos: List[Producto]
    direccion: Optional[str] = None

class PedidoUpdate(BaseModel):
    estado: Optional[str] = None
    direccion: Optional[str] = None

class PedidoResponse(BaseModel):
    id: int
    usuarioId: int
    productos: List[dict]
    estado: str
    total: float
    direccion: Optional[str]
    createdAt: Optional[datetime]
    updatedAt: Optional[datetime]

    class Config:
        from_attributes = True
