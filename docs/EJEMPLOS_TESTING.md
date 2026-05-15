# 🧪 Ejemplos de Uso y Testing

## 📌 Ejemplos con cURL

### 1️⃣ USUARIOS - Crear usuario

```bash
curl -X POST http://localhost:3001/api/usuarios \
  -H "Content-Type: application/json" \
  -d '{
    "nombre": "Carlos López",
    "email": "carlos@example.com",
    "contraseña": "password123",
    "telefono": "+34 912 345 678"
  }'
```

**Respuesta (201):**
```json
{
  "_id": "507f1f77bcf86cd799439011",
  "nombre": "Carlos López",
  "email": "carlos@example.com",
  "contraseña": "password123",
  "telefono": "+34 912 345 678",
  "activo": true,
  "createdAt": "2024-01-15T10:30:00Z"
}
```

---

### 2️⃣ USUARIOS - Obtener todos los usuarios

```bash
curl http://localhost:3001/api/usuarios
```

**Respuesta (200):**
```json
[
  {
    "_id": "507f1f77bcf86cd799439011",
    "nombre": "Carlos López",
    "email": "carlos@example.com",
    ...
  },
  {
    "_id": "507f1f77bcf86cd799439012",
    "nombre": "María García",
    "email": "maria@example.com",
    ...
  }
]
```

---

### 3️⃣ USUARIOS - Obtener usuario específico

```bash
curl http://localhost:3001/api/usuarios/507f1f77bcf86cd799439011
```

**Respuesta (200):**
```json
{
  "_id": "507f1f77bcf86cd799439011",
  "nombre": "Carlos López",
  "email": "carlos@example.com",
  "contraseña": "password123",
  "telefono": "+34 912 345 678",
  "activo": true,
  "createdAt": "2024-01-15T10:30:00Z"
}
```

---

### 4️⃣ USUARIOS - Actualizar usuario

```bash
curl -X PUT http://localhost:3001/api/usuarios/507f1f77bcf86cd799439011 \
  -H "Content-Type: application/json" \
  -d '{
    "nombre": "Carlos López Pérez",
    "telefono": "+34 912 345 679",
    "activo": true
  }'
```

**Respuesta (200):**
```json
{
  "_id": "507f1f77bcf86cd799439011",
  "nombre": "Carlos López Pérez",
  "email": "carlos@example.com",
  "contraseña": "password123",
  "telefono": "+34 912 345 679",
  "activo": true,
  "createdAt": "2024-01-15T10:30:00Z"
}
```

---

### 5️⃣ USUARIOS - Eliminar usuario

```bash
curl -X DELETE http://localhost:3001/api/usuarios/507f1f77bcf86cd799439011
```

**Respuesta (200):**
```json
{
  "mensaje": "Usuario eliminado correctamente"
}
```

---

### 6️⃣ PEDIDOS - Crear pedido (verificando usuario)

```bash
curl -X POST http://localhost:3002/api/pedidos \
  -H "Content-Type: application/json" \
  -d '{
    "usuarioId": "507f1f77bcf86cd799439011",
    "productos": [
      {
        "nombre": "iPhone 15",
        "cantidad": 1,
        "precio": 999.99
      },
      {
        "nombre": "Apple Watch",
        "cantidad": 1,
        "precio": 399.99
      }
    ],
    "direccion": "Avenida de la Paz 42, Madrid 28002"
  }'
```

**Respuesta (201):**
```json
{
  "_id": "507f1f77bcf86cd799439020",
  "usuarioId": "507f1f77bcf86cd799439011",
  "productos": [
    {
      "nombre": "iPhone 15",
      "cantidad": 1,
      "precio": 999.99
    },
    {
      "nombre": "Apple Watch",
      "cantidad": 1,
      "precio": 399.99
    }
  ],
  "estado": "pendiente",
  "total": 1399.98,
  "direccion": "Avenida de la Paz 42, Madrid 28002",
  "createdAt": "2024-01-15T10:35:00Z",
  "updatedAt": "2024-01-15T10:35:00Z"
}
```

---

### 7️⃣ PEDIDOS - Error: Usuario no existe

```bash
curl -X POST http://localhost:3002/api/pedidos \
  -H "Content-Type: application/json" \
  -d '{
    "usuarioId": "507f1f77bcf86cd799999999",
    "productos": [{"nombre": "Producto", "cantidad": 1, "precio": 99.99}],
    "direccion": "Calle Test"
  }'
```

**Respuesta (404):**
```json
{
  "error": "Usuario no encontrado o servicio de usuarios no disponible"
}
```

---

### 8️⃣ PEDIDOS - Obtener todos los pedidos

```bash
curl http://localhost:3002/api/pedidos
```

**Respuesta (200):**
```json
[
  {
    "_id": "507f1f77bcf86cd799439020",
    "usuarioId": "507f1f77bcf86cd799439011",
    "productos": [...],
    "estado": "pendiente",
    "total": 1399.98,
    ...
  }
]
```

---

### 9️⃣ PEDIDOS - Obtener pedidos de un usuario específico

```bash
curl http://localhost:3002/api/pedidos/usuario/507f1f77bcf86cd799439011
```

**Respuesta (200):**
```json
[
  {
    "_id": "507f1f77bcf86cd799439020",
    "usuarioId": "507f1f77bcf86cd799439011",
    "productos": [...],
    "estado": "pendiente",
    "total": 1399.98,
    ...
  }
]
```

---

### 🔟 PEDIDOS - Actualizar estado del pedido

```bash
curl -X PUT http://localhost:3002/api/pedidos/507f1f77bcf86cd799439020 \
  -H "Content-Type: application/json" \
  -d '{
    "estado": "procesando"
  }'
```

**Respuesta (200):**
```json
{
  "_id": "507f1f77bcf86cd799439020",
  "usuarioId": "507f1f77bcf86cd799439011",
  "productos": [...],
  "estado": "procesando",
  "total": 1399.98,
  "updatedAt": "2024-01-15T10:40:00Z",
  ...
}
```

---

### 1️⃣1️⃣ PEDIDOS - Eliminar pedido

```bash
curl -X DELETE http://localhost:3002/api/pedidos/507f1f77bcf86cd799439020
```

**Respuesta (200):**
```json
{
  "mensaje": "Pedido eliminado correctamente"
}
```

---

## 🧬 Flujo de Prueba Completo (Step by Step)

### Paso 1: Crear usuario
```bash
USER_ID=$(curl -s -X POST http://localhost:3001/api/usuarios \
  -H "Content-Type: application/json" \
  -d '{
    "nombre": "Test User",
    "email": "test@example.com",
    "contraseña": "test123",
    "telefono": "123456789"
  }' | jq -r '._id')

echo "Usuario creado: $USER_ID"
```

### Paso 2: Crear pedido
```bash
PEDIDO_ID=$(curl -s -X POST http://localhost:3002/api/pedidos \
  -H "Content-Type: application/json" \
  -d '{
    "usuarioId": "'$USER_ID'",
    "productos": [
      {"nombre": "Producto 1", "cantidad": 1, "precio": 49.99},
      {"nombre": "Producto 2", "cantidad": 2, "precio": 29.99}
    ],
    "direccion": "Dirección Test 123"
  }' | jq -r '._id')

echo "Pedido creado: $PEDIDO_ID"
```

### Paso 3: Cambiar estado del pedido
```bash
curl -X PUT http://localhost:3002/api/pedidos/$PEDIDO_ID \
  -H "Content-Type: application/json" \
  -d '{"estado": "enviado"}' | jq
```

### Paso 4: Obtener detalles del pedido
```bash
curl http://localhost:3002/api/pedidos/$PEDIDO_ID | jq
```

---

## 📋 Postman Collection (JSON)

Puedes importar esta colección en Postman:

```json
{
  "info": {
    "name": "Microservicios API",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "item": [
    {
      "name": "Usuarios",
      "item": [
        {
          "name": "Crear Usuario",
          "request": {
            "method": "POST",
            "url": {
              "raw": "http://localhost:3001/api/usuarios",
              "protocol": "http",
              "host": ["localhost"],
              "port": "3001",
              "path": ["api", "usuarios"]
            },
            "body": {
              "mode": "raw",
              "raw": "{\"nombre\":\"Test\",\"email\":\"test@example.com\",\"contraseña\":\"test123\",\"telefono\":\"123456789\"}"
            }
          }
        },
        {
          "name": "Obtener Usuarios",
          "request": {
            "method": "GET",
            "url": {
              "raw": "http://localhost:3001/api/usuarios",
              "protocol": "http",
              "host": ["localhost"],
              "port": "3001",
              "path": ["api", "usuarios"]
            }
          }
        }
      ]
    },
    {
      "name": "Pedidos",
      "item": [
        {
          "name": "Crear Pedido",
          "request": {
            "method": "POST",
            "url": {
              "raw": "http://localhost:3002/api/pedidos",
              "protocol": "http",
              "host": ["localhost"],
              "port": "3002",
              "path": ["api", "pedidos"]
            },
            "body": {
              "mode": "raw",
              "raw": "{\"usuarioId\":\"USER_ID\",\"productos\":[{\"nombre\":\"Producto\",\"cantidad\":1,\"precio\":99.99}],\"direccion\":\"Calle Test\"}"
            }
          }
        }
      ]
    }
  ]
}
```

---

## 🔍 Testing de Errores

### Usuario duplicado
```bash
# Primera vez: éxito
curl -X POST http://localhost:3001/api/usuarios \
  -H "Content-Type: application/json" \
  -d '{"nombre":"John","email":"john@example.com","contraseña":"pass","telefono":"123"}'

# Segunda vez: error 400
curl -X POST http://localhost:3001/api/usuarios \
  -H "Content-Type: application/json" \
  -d '{"nombre":"John","email":"john@example.com","contraseña":"pass","telefono":"123"}'
```

Respuesta (400):
```json
{
  "error": "El email ya está registrado"
}
```

---

## 💡 Tips útiles

### Instalar jq (para parsear JSON)
```bash
# Windows (si tienes scoop)
scoop install jq

# macOS
brew install jq

# Linux (Debian/Ubuntu)
sudo apt-get install jq
```

### Usar jq para extraer campos
```bash
# Obtener solo el ID
curl http://localhost:3001/api/usuarios | jq '.[0]._id'

# Obtener nombre y email
curl http://localhost:3001/api/usuarios | jq '.[] | {nombre, email}'
```

### Guardar respuesta en variable
```bash
RESPONSE=$(curl -s http://localhost:3001/api/usuarios)
echo $RESPONSE | jq
```


