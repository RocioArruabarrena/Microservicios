# 🛠️ Guía de Desarrollo Local

## 📋 Requisitos

- Python 3.11+
- PostgreSQL 15+
- pip (gestor de paquetes Python)

## 🚀 Configuración Local Sin Docker

### 1. Instalar PostgreSQL

#### En Windows (Descarga)
1. Ir a https://www.postgresql.org/download/windows/
2. Descargar e instalar PostgreSQL 15+
3. Recordar la contraseña del usuario `postgres` (usar: `password`)
4. Verificar la instalación:
```bash
psql -U postgres -c "SELECT version();"
```

### 2. Crear bases de datos

```bash
# Conectar a PostgreSQL
psql -U postgres

# Crear las bases de datos
CREATE DATABASE usuarios;
CREATE DATABASE pedidos;

# Salir
\q
```

### 3. Usuario Service

```bash
cd usuario-service

# Crear entorno virtual (recomendado)
python -m venv venv
venv\Scripts\activate  # En Windows

# Instalar dependencias
pip install -r requirements.txt

# Crear archivo .env (ya existe)
cat .env

# Ejecutar migraciones (SQLAlchemy lo hace automáticamente)

# Iniciar servicio
python main.py
# Verá: INFO:     Uvicorn running on http://0.0.0.0:8001
```

**En otra terminal:**

### 4. Pedido Service

```bash
cd pedido-service

# Crear entorno virtual
python -m venv venv
venv\Scripts\activate  # En Windows

# Instalar dependencias
pip install -r requirements.txt

# Crear archivo .env (ya existe)
cat .env

# Iniciar servicio
python main.py
# Verá: INFO:     Uvicorn running on http://0.0.0.0:8002
```

---

## 📚 URLs Locales

```
Usuarios Swagger:  http://localhost:8001/docs
Pedidos Swagger:   http://localhost:8002/docs
Usuarios Health:   http://localhost:8001/health
Pedidos Health:    http://localhost:8002/health
PostgreSQL:        localhost:5432
```

---

## 🔄 Desarrollo Continuo (Con reload)

FastAPI/Uvicorn automáticamente recarga cuando cambias archivos:

```bash
# Simplemente ejecuta:
python main.py

# Se reinicia automáticamente cuando cambias archivos
```

Para desactivar el reload:
```bash
uvicorn main:app --host 0.0.0.0 --port 8001 --no-reload
```

---

## 📝 Variables de Entorno Locales

### usuario-service/.env
```
DATABASE_URL=postgresql://postgres:password@localhost:5432/usuarios
PORT=8001
```

### pedido-service/.env
```
DATABASE_URL=postgresql://postgres:password@localhost:5432/pedidos
PORT=8002
USUARIO_SERVICE_URL=http://localhost:8001
```

---

## 🧪 Testing Local

### Terminal 1: PostgreSQL
```bash
# Asegúrate de que PostgreSQL está corriendo
psql -U postgres -c "SELECT 1;"
```

### Terminal 2: Usuario Service
```bash
cd usuario-service
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
python main.py
# Verá: INFO:     Uvicorn running on http://0.0.0.0:8001
```

### Terminal 3: Pedido Service
```bash
cd pedido-service
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
python main.py
# Verá: INFO:     Uvicorn running on http://0.0.0.0:8002
```

### Terminal 4: Pruebas

#### Crear usuario:
```bash
curl -X POST http://localhost:8001/api/usuarios \
  -H "Content-Type: application/json" \
  -d '{
    "nombre": "Test User",
    "email": "test@example.com",
    "contraseña": "password123",
    "telefono": "123456789"
  }'
```

#### Crear pedido (con ID de usuario):
```bash
curl -X POST http://localhost:8002/api/pedidos \
  -H "Content-Type: application/json" \
  -d '{
    "usuarioId": 1,
    "productos": [
      {"nombre": "Item 1", "cantidad": 2, "precio": 10.0}
    ],
    "direccion": "Test Street 123"
  }'
```

---

## 🐛 Debugging

### Ver logs detallados

**Opción 1: Habilitar SQL logging**
```python
# Agregar en main.py
import logging
logging.basicConfig()
logging.getLogger('sqlalchemy.engine').setLevel(logging.INFO)
```

**Opción 2: Usar DEBUG mode**
```bash
PYTHONUNBUFFERED=1 python main.py
```

### Acceder a la base de datos

```bash
# Conectar a usuarios
psql -U postgres -d usuarios

# Ver tablas
\dt

# Ver estructura de tabla
\d usuarios

# Ejecutar query
SELECT * FROM usuarios;

# Salir
\q
```

---

## 🔧 Troubleshooting

### Error: "Connection refused" a PostgreSQL
- Verificar que PostgreSQL está corriendo: `psql -U postgres`
- Verificar credenciales en .env
- Verificar puerto 5432 (default)

### Error: "Module not found"
```bash
# Asegúrate de que estás en el venv activado
# En Windows:
venv\Scripts\activate
# En Linux/Mac:
source venv/bin/activate

pip install -r requirements.txt
```

### Error: "Port already in use"
```bash
# Cambiar puerto en .env o línea de comandos
uvicorn main:app --port 8003
```

### Resetear base de datos
```bash
psql -U postgres -d usuarios -c "DROP TABLE usuarios; DROP TABLE pedidos;"
# Las tablas se recrearán automáticamente
```**
```bash
node --inspect server.js
```

Luego en Chrome: `chrome://inspect`

