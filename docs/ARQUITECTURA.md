Comunicación entre Microservicios
## 📡 Endpoints de Comunicación

### De Pedido Service a Usuario Service

```javascript
// En pedido-service/controllers/pedidoController.js

// Verificar usuario antes de crear pedido
const respuestaUsuario = await axios.get(
  `${USUARIO_SERVICE_URL}/api/usuarios/${usuarioId}`
);

// URL en desarrollo local:
// http://localhost:3001/api/usuarios/{usuarioId}

// URL en Docker:
// http://usuario-service:3001/api/usuarios/{usuarioId}
```

## 🔐 Características de Seguridad

1. **Validación de Usuario**: No se puede crear pedido sin usuario válido
2. **CORS Habilitado**: Permite comunicación entre servicios
3. **Separación de BD**: Cada servicio tiene su propia base de datos
4. **Manejo de Errores**: Respuestas consistentes en caso de fallo

## 📊 Estructura de Respuestas

### Respuesta Exitosa - Crear Pedido

```json
{
  "_id": "507f1f77bcf86cd799439011",
  "usuarioId": "507f1f77bcf86cd799439012",
  "productos": [
    {
      "nombre": "Laptop",
      "cantidad": 1,
      "precio": 999.99
    }
  ],
  "estado": "pendiente",
  "total": 999.99,
  "direccion": "Calle Principal 123",
  "createdAt": "2024-01-15T10:30:00Z",
  "updatedAt": "2024-01-15T10:30:00Z"
}
```

### Respuesta de Error - Usuario no encontrado

```json
{
  "error": "Usuario no encontrado o servicio de usuarios no disponible"
}
```

Status Code: 404

## 🔄 Estados de Pedidos

Los pedidos pueden estar en los siguientes estados:

| Estado | Descripción |
|--------|-------------|
| `pendiente` | Pedido recién creado, en espera de procesamiento |
| `procesando` | El pedido está siendo procesado |
| `enviado` | El pedido ha sido enviado |
| `entregado` | El pedido ha sido entregado al cliente |
| `cancelado` | El pedido ha sido cancelado |

### Cambiar Estado de Pedido

```bash
curl -X PUT http://localhost:3002/api/pedidos/{pedidoId} \
  -H "Content-Type: application/json" \
  -d '{
    "estado": "procesando"
  }'
```

## 💾 Persistencia de Datos

### MongoDB Volumes

```yaml
volumes:
  mongodb_data:
    # Los datos de MongoDB se persisten en un volumen de Docker
```

Esto significa que:
- Los datos persisten incluso si detienes los contenedores
- Los datos se pierden solo si ejecutas `docker-compose down -v`

## 🌐 Redes en Docker

```yaml
networks:
  microservicios-network:
    driver: bridge
```

Permite que los servicios se comuniquen por nombre:
- `usuario-service` → http://usuario-service:3001
- `pedido-service` → http://pedido-service:3002
- `mongodb` → mongodb://mongodb:27017

## 🚀 Health Checks

Ambos servicios tienen un endpoint de salud:

```bash
# Usuario Service
curl http://localhost:3001/health
# Respuesta: {"status": "Usuario service is running"}

# Pedido Service
curl http://localhost:3002/health
# Respuesta: {"status": "Pedido service is running"}
```

## 📈 Escalabilidad

Para escalar a múltiples instancias:

```bash
# Crear múltiples instancias del servicio de usuarios
docker-compose up --scale usuario-service=3 -d
```

## 🔍 Monitoreo

### Ver estado de contenedores

```bash
docker ps
```

### Ver recursos usados

```bash
docker stats
```

### Inspeccionar red

```bash
docker network ls
docker network inspect microservicios-network
```

---

