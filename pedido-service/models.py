from sqlalchemy import Column, Integer, String, Float, DateTime, JSON
from database import Base
from datetime import datetime

class Pedido(Base):
    __tablename__ = "pedidos"

    id = Column(Integer, primary_key=True, index=True)
    usuarioId = Column(Integer, nullable=False)
    productos = Column(JSON, nullable=False)
    estado = Column(String, default="pendiente")
    total = Column(Float, nullable=False)
    direccion = Column(String, nullable=True)
    createdAt = Column(DateTime, default=datetime.utcnow)
    updatedAt = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    def to_dict(self):
        return {
            "id": self.id,
            "usuarioId": self.usuarioId,
            "productos": self.productos,
            "estado": self.estado,
            "total": self.total,
            "direccion": self.direccion,
            "createdAt": self.createdAt.isoformat() if self.createdAt else None,
            "updatedAt": self.updatedAt.isoformat() if self.updatedAt else None
        }
