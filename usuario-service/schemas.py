from pydantic import BaseModel, EmailStr, Field
from typing import Optional
from datetime import datetime

class UsuarioCreate(BaseModel):
    nombre: str = Field(..., min_length=1)
    email: EmailStr
    contraseña: str = Field(..., min_length=6)
    telefono: Optional[str] = None

class UsuarioUpdate(BaseModel):
    nombre: Optional[str] = None
    email: Optional[EmailStr] = None
    telefono: Optional[str] = None
    activo: Optional[bool] = None

class UsuarioResponse(BaseModel):
    id: int
    nombre: str
    email: str
    telefono: Optional[str]
    activo: bool
    createdAt: Optional[datetime]

    class Config:
        from_attributes = True
