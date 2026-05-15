from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
import bcrypt
import os
from dotenv import load_dotenv

from database import get_db, engine, Base
from models import Usuario
from schemas import UsuarioCreate, UsuarioUpdate, UsuarioResponse

load_dotenv()

# Crear tablas
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Usuario Service",
    description="Microservicio de gestión de usuarios",
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

def hash_password(password: str) -> str:
    """Hashear contraseña con bcrypt"""
    salt = bcrypt.gensalt()
    return bcrypt.hashpw(password.encode(), salt).decode()

# ==================== HEALTH CHECK ====================

@app.get("/health", tags=["Health"])
async def health_check():
    """Verificar que el servicio está activo"""
    return {"status": "Usuario service is running"}


# ==================== USUARIOS CRUD ====================

@app.post("/api/usuarios", response_model=UsuarioResponse, status_code=201, tags=["Usuarios"])
async def crear_usuario(usuario: UsuarioCreate, db: Session = Depends(get_db)):
    """Crear un nuevo usuario. Email debe ser único"""
    # Verificar si el email ya existe
    usuario_existente = db.query(Usuario).filter(Usuario.email == usuario.email).first()
    if usuario_existente:
        raise HTTPException(
            status_code=400,
            detail="El email ya está registrado"
        )
    
    # Hashear contraseña
    contraseña_hasheada = hash_password(usuario.contraseña)
    
    # Crear nuevo usuario
    nuevo_usuario = Usuario(
        nombre=usuario.nombre,
        email=usuario.email,
        contraseña=contraseña_hasheada,
        telefono=usuario.telefono
    )
    
    try:
        db.add(nuevo_usuario)
        db.commit()
        db.refresh(nuevo_usuario)
        return nuevo_usuario
    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=400,
            detail="El email ya está registrado"
        )
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=500,
            detail=str(e)
        )


@app.get("/api/usuarios", response_model=list[UsuarioResponse], tags=["Usuarios"])
async def obtener_usuarios(db: Session = Depends(get_db)):
    """Obtener todos los usuarios registrados"""
    usuarios = db.query(Usuario).all()
    return usuarios


@app.get("/api/usuarios/{usuario_id}", response_model=UsuarioResponse, tags=["Usuarios"])
async def obtener_usuario(usuario_id: int, db: Session = Depends(get_db)):
    """Obtener un usuario específico por ID"""
    usuario = db.query(Usuario).filter(Usuario.id == usuario_id).first()
    if not usuario:
        raise HTTPException(
            status_code=404,
            detail="Usuario no encontrado"
        )
    return usuario


@app.put("/api/usuarios/{usuario_id}", response_model=UsuarioResponse, tags=["Usuarios"])
async def actualizar_usuario(
    usuario_id: int,
    usuario_update: UsuarioUpdate,
    db: Session = Depends(get_db)
):
    """Actualizar datos de un usuario existente"""
    usuario = db.query(Usuario).filter(Usuario.id == usuario_id).first()
    if not usuario:
        raise HTTPException(
            status_code=404,
            detail="Usuario no encontrado"
        )
    
    # Actualizar solo los campos proporcionados
    if usuario_update.nombre is not None:
        usuario.nombre = usuario_update.nombre
    if usuario_update.email is not None:
        # Verificar que el nuevo email no exista
        email_existente = db.query(Usuario).filter(
            Usuario.email == usuario_update.email,
            Usuario.id != usuario_id
        ).first()
        if email_existente:
            raise HTTPException(
                status_code=400,
                detail="El email ya está en uso"
            )
        usuario.email = usuario_update.email
    if usuario_update.telefono is not None:
        usuario.telefono = usuario_update.telefono
    if usuario_update.activo is not None:
        usuario.activo = usuario_update.activo
    
    try:
        db.commit()
        db.refresh(usuario)
        return usuario
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=500,
            detail=str(e)
        )


@app.delete("/api/usuarios/{usuario_id}", tags=["Usuarios"])
async def eliminar_usuario(usuario_id: int, db: Session = Depends(get_db)):
    """Eliminar un usuario por ID"""
    usuario = db.query(Usuario).filter(Usuario.id == usuario_id).first()
    if not usuario:
        raise HTTPException(
            status_code=404,
            detail="Usuario no encontrado"
        )
    
    try:
        db.delete(usuario)
        db.commit()
        return {"mensaje": "Usuario eliminado correctamente"}
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=500,
            detail=str(e)
        )


if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", 8001))
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=port,
        reload=True
    )
