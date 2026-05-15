from sqlalchemy import Column, Integer, String, Boolean, DateTime, func
from database import Base
from datetime import datetime

class Usuario(Base):
    __tablename__ = "usuarios"

    id = Column(Integer, primary_key=True, index=True)
    nombre = Column(String, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    contraseña = Column(String, nullable=False)
    telefono = Column(String, nullable=True)
    activo = Column(Boolean, default=True)
    createdAt = Column(DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            "id": self.id,
            "nombre": self.nombre,
            "email": self.email,
            "contraseña": self.contraseña,
            "telefono": self.telefono,
            "activo": self.activo,
            "createdAt": self.createdAt.isoformat() if self.createdAt else None
        }
