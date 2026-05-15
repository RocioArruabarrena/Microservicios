from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
import httpx
import os
from dotenv import load_dotenv

from database import get_db, engine, Base
from models import Pedido
from schemas import PedidoCreate, PedidoUpdate, PedidoResponse

load_dotenv()

# Crear tablas
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Pedido Service",
    description="Microservicio de gestión de pedidos",
    version="1.0.0"
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

USUARIO_SERVICE_URL = os.getenv("USUARIO_SERVICE_URL", "http://localhost:8001")

async def verificar_usuario_existe(usuario_id: int) -> bool:
    """Verificar que un usuario existe consultando al servicio de usuarios"""
    try:
        async with httpx.AsyncClient(timeout=5.0) as client:
            response = await client.get(f"{USUARIO_SERVICE_URL}/api/usuarios/{usuario_id}")
            return response.status_code == 200
    except Exception as e:
        raise HTTPException(
            status_code=503,
            detail="Error de comunicación con servicio de usuarios"
        )


# ==================== HEALTH CHECK ====================

@app.get("/health", tags=["Health"])
async def health_check():
    """Verificar que el servicio está activo"""
    return {"status": "Pedido service is running"}


# ==================== PEDIDOS CRUD ====================

@app.post("/api/pedidos", response_model=PedidoResponse, status_code=201, tags=["Pedidos"])
async def crear_pedido(pedido: PedidoCreate, db: Session = Depends(get_db)):
    """Crear un nuevo pedido. Valida que el usuario exista"""
    # Verificar que el usuario existe
    usuario_existe = await verificar_usuario_existe(pedido.usuarioId)
    if not usuario_existe:
        raise HTTPException(
            status_code=404,
            detail="Usuario no encontrado"
        )
    
    # Calcular total
    productos_list = [p.model_dump() for p in pedido.productos]
    total = sum(p["cantidad"] * p["precio"] for p in productos_list)
    
    # Crear nuevo pedido
    nuevo_pedido = Pedido(
        usuarioId=pedido.usuarioId,
        productos=productos_list,
        total=total,
        direccion=pedido.direccion
    )
    
    try:
        db.add(nuevo_pedido)
        db.commit()
        db.refresh(nuevo_pedido)
        return nuevo_pedido
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=500,
            detail=str(e)
        )


@app.get("/api/pedidos", response_model=list[PedidoResponse], tags=["Pedidos"])
async def obtener_pedidos(db: Session = Depends(get_db)):
    """Obtener todos los pedidos registrados"""
    pedidos = db.query(Pedido).all()
    return pedidos


@app.get("/api/pedidos/{pedido_id}", response_model=PedidoResponse, tags=["Pedidos"])
async def obtener_pedido(pedido_id: int, db: Session = Depends(get_db)):
    """Obtener un pedido específico por ID"""
    pedido = db.query(Pedido).filter(Pedido.id == pedido_id).first()
    if not pedido:
        raise HTTPException(
            status_code=404,
            detail="Pedido no encontrado"
        )
    return pedido


@app.get("/api/pedidos/usuario/{usuario_id}", response_model=list[PedidoResponse], tags=["Pedidos"])
async def obtener_pedidos_usuario(usuario_id: int, db: Session = Depends(get_db)):
    """Obtener todos los pedidos de un usuario específico"""
    # Verificar que el usuario existe
    usuario_existe = await verificar_usuario_existe(usuario_id)
    if not usuario_existe:
        raise HTTPException(
            status_code=404,
            detail="Usuario no encontrado"
        )
    
    pedidos = db.query(Pedido).filter(Pedido.usuarioId == usuario_id).all()
    return pedidos


@app.put("/api/pedidos/{pedido_id}", response_model=PedidoResponse, tags=["Pedidos"])
async def actualizar_pedido(
    pedido_id: int,
    pedido_update: PedidoUpdate,
    db: Session = Depends(get_db)
):
    """Actualizar un pedido existente"""
    pedido = db.query(Pedido).filter(Pedido.id == pedido_id).first()
    if not pedido:
        raise HTTPException(
            status_code=404,
            detail="Pedido no encontrado"
        )
    
    # Validar estado si se proporciona
    estados_validos = ["pendiente", "procesando", "enviado", "entregado", "cancelado"]
    if pedido_update.estado and pedido_update.estado not in estados_validos:
        raise HTTPException(
            status_code=400,
            detail=f"Estado inválido. Debe ser uno de: {', '.join(estados_validos)}"
        )
    
    # Actualizar campos
    if pedido_update.estado is not None:
        pedido.estado = pedido_update.estado
    if pedido_update.direccion is not None:
        pedido.direccion = pedido_update.direccion
    
    try:
        db.commit()
        db.refresh(pedido)
        return pedido
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=500,
            detail=str(e)
        )


@app.delete("/api/pedidos/{pedido_id}", tags=["Pedidos"])
async def eliminar_pedido(pedido_id: int, db: Session = Depends(get_db)):
    """Eliminar un pedido por ID"""
    pedido = db.query(Pedido).filter(Pedido.id == pedido_id).first()
    if not pedido:
        raise HTTPException(
            status_code=404,
            detail="Pedido no encontrado"
        )
    
    try:
        db.delete(pedido)
        db.commit()
        return {"mensaje": "Pedido eliminado correctamente"}
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=500,
            detail=str(e)
        )


if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", 8002))
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=port,
        reload=True
    )
