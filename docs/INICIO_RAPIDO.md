# 📋 Instrucciones de Ejecución Rápida

## 🚀 Con Docker (Recomendado)

```bash
# 1. Navega a la carpeta del proyecto
cd c:\Users\arruabarrena\Desktop\MicroServicios

# 2. Inicia los servicios
docker-compose up --build

# 3. Espera a que todos los servicios estén listos
# Verás mensajes como:
# ✓ Conectado a MongoDB - Usuarios
# 🚀 Usuario Service ejecutándose en puerto 3001
# 🚀 Pedido Service ejecutándose en puerto 3002
```

## 🌐 Accede a los servicios

**Documentación de APIs (Swagger UI):**
- Usuario: http://localhost:3001/api-docs
- Pedidos: http://localhost:3002/api-docs

**Health Check:**
- Usuario: http://localhost:3001/health
- Pedidos: http://localhost:3002/health

## 🧪 Prueba los endpoints

### Crear un Usuario:
```bash
curl -X POST http://localhost:3001/api/usuarios \
  -H "Content-Type: application/json" \
  -d '{
    "nombre": "Juan García",
    "email": "juan@example.com",
    "contraseña": "secure123",
    "telefono": "+34 123 456 789"
  }'
```

Guarda el `_id` de la respuesta (ejemplo: `507f1f77bcf86cd799439011`)

### Crear un Pedido:
```bash
curl -X POST http://localhost:3002/api/pedidos \
  -H "Content-Type: application/json" \
  -d '{
    "usuarioId": "TU_USER_ID_AQUI",
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
