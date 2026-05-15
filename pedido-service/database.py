from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
import os
from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = os.getenv(
    "DATABASE_URL",
    "postgresql://postgres:password@localhost:5432/pedidos"
)

# Crear engine sin validar conexión inmediatamente
engine = create_engine(
    DATABASE_URL,
    pool_pre_ping=True,  # Verifica conexión antes de usar
    pool_recycle=3600,   # Recicla conexiones cada hora
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
