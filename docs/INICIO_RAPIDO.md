# 📋 Instrucciones de Ejecución Rápida

## 🚀 Con Docker (Recomendado)

```bash
# 1. Navega a la carpeta del proyecto
cd c:\Users\arruabarrena\Desktop\MicroServicios

# 2. Inicia los servicios
docker-compose up --build

# 3. Espera a que todos los servicios estén listos
# Verás mensajes como:
# ✓ Conectado a PostgreSQL - Usuarios
# 🚀 Usuario Service ejecutándose en puerto 8001
# 🚀 Pedido Service ejecutándose en puerto 8002
```

## 🌐 Accede a los servicios

**Documentación de APIs (Swagger UI):**
- Usuario: http://localhost:8001/docs
- Pedidos: http://localhost:8002/docs

**Health Check:**
- Usuario: http://localhost:8001/health
- Pedidos: http://localhost:8002/health

**PostgreSQL:**
- Host: localhost:5432
- Usuario: postgres
- Contraseña: password
- Base de datos usuarios: usuarios
- Base de datos pedidos: pedidos

## 🧪 Prueba los endpoints

### Crear un Usuario:
```bash
curl -X POST http://localhost:8001/api/usuarios \
  -H "Content-Type: application/json" \
  -d '{
    "nombre": "Juan García",
    "email": "juan@example.com",
    "contraseña": "secure123",
    "telefono": "+34 123 456 789"
  }'
```

Guarda el `id` de la respuesta (ejemplo: `1`)

### Crear un Pedido:
```bash
curl -X POST http://localhost:8002/api/pedidos \
  -H "Content-Type: application/json" \
  -d '{
    "usuarioId": 1,
    "productos": [
      {"nombre": "Laptop", "cantidad": 1, "precio": 999.99},
      {"nombre": "Mouse", "cantidad": 2, "precio": 29.99}
    ],
    "direccion": "Calle Principal 123"
  }'
```

## 📚 Estructura del Proyecto

```
MicroServicios/
├── docker-compose.yml          # Orquestación con FastAPI + PostgreSQL
├── init-db.sql                 # Script de inicialización de BD
├── usuario-service/            # Microservicio de usuarios (FastAPI)
│   ├── main.py                 # Aplicación principal
│   ├── models.py               # Modelos SQLAlchemy
│   ├── schemas.py              # Schemas Pydantic
│   ├── database.py             # Configuración BD
│   ├── requirements.txt         # Dependencias Python
│   ├── Dockerfile              # Imagen Docker
│   ├── conftest.py             # Configuración pytest
│   ├── test_usuario.py         # Tests unitarios
│   └── .env                    # Variables de entorno
├── pedido-service/             # Microservicio de pedidos (FastAPI)
│   ├── main.py                 # Aplicación principal
│   ├── models.py               # Modelos SQLAlchemy
│   ├── schemas.py              # Schemas Pydantic
│   ├── database.py             # Configuración BD
│   ├── requirements.txt         # Dependencias Python
│   ├── Dockerfile              # Imagen Docker
│   ├── conftest.py             # Configuración pytest
│   ├── test_pedido.py          # Tests unitarios
│   └── .env                    # Variables de entorno
└── docs/
    ├── ARQUITECTURA.md         # Diagrama de arquitectura
    ├── DESARROLLO_LOCAL.md     # Guía de desarrollo local
    ├── EJEMPLOS_TESTING.md     # Ejemplos de testing
    └── INICIO_RAPIDO.md        # Este archivo
```
    "productos": [
      {
        "nombre": "MacBook Pro",
        "cantidad": 1,
        "precio": 1999.99
      },
      {
        "nombre": "Mouse",
        "cantidad": 2,
        "precio": 29.99
      }
    ],
    "direccion": "Calle Mayor 123, Madrid 28001"
  }'
```

### Obtener Pedidos del Usuario:
```bash
curl http://localhost:3002/api/pedidos/usuario/TU_USER_ID_AQUI
```

## 🛑 Detener los servicios

```bash
docker-compose down
```

## 📊 Visualizar Logs

```bash
# Todos los servicios
docker-compose logs -f

# Solo un servicio
docker-compose logs -f usuario-service
docker-compose logs -f pedido-service
```

## ✅ Verificar que todo funciona

1. Abre http://localhost:3001/api-docs en tu navegador
2. Prueba los endpoints desde Swagger UI
3. Repite con http://localhost:3002/api-docs
