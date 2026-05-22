# 🔐 GUÍA DE AUTENTICACIÓN ENTRE MICROSERVICIOS

## ✅ Implementación Completada

Se ha implementado un sistema completo de autenticación basado en JWT tokens que permite asegurar la comunicación entre microservicios.

---

## 📋 Estructura del Sistema

### 1. **Microservicio de Autenticación (Auth Service)**
- **Puerto**: 3000
- **Ubicación**: `/auth`
- **Responsabilidad**: Emitir y validar tokens JWT

#### Endpoints:
```
POST /api/v1/auth/create-user
- Crear nuevo usuario
- Body: { name, email, password, role }
- Respuesta: { token, user }

POST /api/v1/auth/login
- Iniciar sesión y obtener token
- Body: { email, password }
- Respuesta: { token, expiresIn, user }

POST /api/v1/auth/validate-token
- Validar token (uso interno)
- Body: { token }
- Respuesta: { valid, payload, user }

GET /api/v1/auth/me
- Obtener datos del usuario autenticado
- Headers: Authorization: Bearer <token>
- Respuesta: { user }

GET /health
- Verificar que el servicio está activo
```

---

### 2. **Microservicio de Usuarios (Usuario Service)**
- **Puerto**: 8001
- **Ubicación**: `/usuario-service`
- **Responsabilidad**: Gestionar usuarios (protegido con autenticación)

#### Endpoints (PROTEGIDOS):
```
POST /api/usuarios
- Crear usuario (solo admin)
- Headers: Authorization: Bearer <token>
- Body: { nombre, email, contraseña, telefono }
- Respuesta: { data: user }

GET /api/usuarios
- Listar todos los usuarios (solo admin)
- Headers: Authorization: Bearer <token>
- Respuesta: { data: [users] }

GET /api/usuarios/{id}
- Obtener usuario específico (autenticado)
- Headers: Authorization: Bearer <token>
- Respuesta: { data: user }

PUT /api/usuarios/{id}
- Actualizar usuario (autenticado)
- Headers: Authorization: Bearer <token>
- Body: { nombre, email, telefono, activo }
- Respuesta: { data: user }

DELETE /api/usuarios/{id}
- Eliminar usuario (solo admin)
- Headers: Authorization: Bearer <token>
- Respuesta: { mensaje: "Usuario eliminado correctamente" }
```

---

### 3. **Microservicio de Pedidos (Pedido Service)**
- **Puerto**: 8002
- **Ubicación**: `/pedido-service`
- **Responsabilidad**: Gestionar pedidos (protegido con autenticación)

#### Endpoints (PROTEGIDOS):
```
POST /api/pedidos
- Crear nuevo pedido
- Headers: Authorization: Bearer <token>

GET /api/pedidos
- Obtener todos los pedidos
- Headers: Authorization: Bearer <token>

GET /api/pedidos/usuario/{usuarioId}
- Obtener pedidos de un usuario
- Headers: Authorization: Bearer <token>

GET /api/pedidos/{id}
- Obtener pedido específico
- Headers: Authorization: Bearer <token>

PUT /api/pedidos/{id}
- Actualizar estado del pedido
- Headers: Authorization: Bearer <token>

DELETE /api/pedidos/{id}
- Eliminar pedido
- Headers: Authorization: Bearer <token>
```

---

## 🚀 FLUJO DE AUTENTICACIÓN

### Paso 1: Crear Usuario o Iniciar Sesión

**Opción A: Crear nuevo usuario**
```bash
POST http://localhost:3000/api/v1/auth/create-user
Content-Type: application/json

{
  "name": "Juan Pérez",
  "email": "juan@example.com",
  "password": "MiContraseña123!",
  "role": "user"
}

RESPUESTA:
{
  "success": true,
  "message": "Usuario creado exitosamente",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "expiresIn": "7d",
    "user": {
      "id": "user-1234567-abcde",
      "name": "Juan Pérez",
      "email": "juan@example.com",
      "role": "user"
    }
  }
}
```

**Opción B: Iniciar sesión (usuario existente)**
```bash
POST http://localhost:3000/api/v1/auth/login
Content-Type: application/json

{
  "email": "admin@example.com",
  "password": "admin123"
}

RESPUESTA:
{
  "success": true,
  "message": "Login exitoso",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "expiresIn": "7d",
    "user": {
      "id": "seed-admin-001",
      "name": "Admin",
      "email": "admin@example.com",
      "role": "admin"
    }
  }
}
```

---

### Paso 2: Usar el Token para Acceder a Recursos Protegidos

Una vez tengas el token, úsalo en el header `Authorization` con formato `Bearer <token>`:

**Ejemplo: Crear usuario en Usuario Service (requiere rol admin)**
```bash
POST http://localhost:8001/api/usuarios
Content-Type: application/json
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

{
  "nombre": "María García",
  "email": "maria@example.com",
  "contraseña": "MiContraseña123!",
  "telefono": "+34 123 456 789"
}

RESPUESTA:
{
  "success": true,
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "nombre": "María García",
    "email": "maria@example.com",
    "telefono": "+34 123 456 789",
    "createdAt": "2024-05-22T10:30:00.000Z"
  }
}
```

**Ejemplo: Obtener usuarios (requiere rol admin)**
```bash
GET http://localhost:8001/api/usuarios
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

RESPUESTA:
{
  "success": true,
  "data": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "nombre": "María García",
      "email": "maria@example.com",
      "telefono": "+34 123 456 789"
    }
  ]
}
```

**Ejemplo: Crear pedido**
```bash
POST http://localhost:8002/api/pedidos
Content-Type: application/json
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

{
  "usuarioId": "507f1f77bcf86cd799439011",
  "productos": [
    {
      "nombre": "Laptop",
      "cantidad": 1,
      "precio": 1500
    }
  ],
  "direccion": "Calle Principal 123"
}

RESPUESTA:
{
  "success": true,
  "_id": "507f1f77bcf86cd799439012",
  "usuarioId": "507f1f77bcf86cd799439011",
  "productos": [...],
  "total": 1500,
  "estado": "pendiente"
}
```

---

## 🔐 Errores de Autenticación

### Sin Token:
```bash
GET http://localhost:8001/api/usuarios

RESPUESTA (401):
{
  "success": false,
  "message": "Token requerido. Obtenelo en POST /api/v1/auth/login del Auth Service."
}
```

### Token Expirado:
```bash
GET http://localhost:8001/api/usuarios
Authorization: Bearer eyJ...EXPIRADO...

RESPUESTA (401):
{
  "success": false,
  "message": "Token expirado. Iniciá sesión nuevamente."
}
```

### Token Inválido:
```bash
GET http://localhost:8001/api/usuarios
Authorization: Bearer invalid_token_xyz

RESPUESTA (401):
{
  "success": false,
  "message": "Token inválido. Debe ser emitido por el Auth Service."
}
```

### Acceso Denegado (rol insuficiente):
```bash
POST http://localhost:8001/api/usuarios
Authorization: Bearer <token_user>  # Token con rol: "user"

RESPUESTA (403):
{
  "success": false,
  "message": "Acceso denegado. Rol requerido: admin."
}
```

---

## 📊 Estructura del JWT Token

El token JWT contiene la siguiente información:

```
Header:
{
  "alg": "HS256",
  "typ": "JWT"
}

Payload (decodificado):
{
  "id": "user-1234567-abcde",
  "email": "juan@example.com",
  "role": "user",
  "iat": 1716363000,      // Issued At
  "exp": 1717000000       // Expiration (7 días después)
}

Signature:
HMACSHA256(
  base64UrlEncode(header) + "." +
  base64UrlEncode(payload),
  "your_super_secret_jwt_key_minimum_32_characters_long"
)
```

---

## 🔑 Variables de Entorno

Todos los servicios usan las siguientes variables:

```env
# .env en raíz del proyecto o en docker-compose.yml

# Autenticación
JWT_SECRET=your_super_secret_jwt_key_minimum_32_characters_long
JWT_EXPIRES_IN=7d

# Puertos
PORT=3000  # Auth Service
PORT=8001  # Usuario Service
PORT=8002  # Pedido Service

# URLs internas (en Docker)
USUARIO_SERVICE_URL=http://usuario-service:8001
PEDIDO_SERVICE_URL=http://pedido-service:8002

# Base de datos
MONGODB_URI=mongodb://mongodb:27017/usuarios  # Usuario Service
MONGODB_URI=mongodb://mongodb:27017/pedidos   # Pedido Service
```

---

## 🧪 Prueba Local

### Opción 1: Usando docker-compose (Recomendado)

```bash
# Iniciar todos los servicios
docker-compose up --build

# En otra terminal, crear un usuario
curl -X POST http://localhost:3000/api/v1/auth/create-user \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "password": "Test123!",
    "role": "user"
  }'

# Copiar el token recibido y usarlo
curl -X GET http://localhost:8001/api/usuarios \
  -H "Authorization: Bearer <TOKEN_AQUI>"
```

### Opción 2: Localmente (sin Docker)

```bash
# Terminal 1: Auth Service
cd auth
npm install
npm run dev

# Terminal 2: Usuario Service
cd usuario-service
npm install
npm run dev

# Terminal 3: Pedido Service
cd pedido-service
npm install
npm run dev

# Terminal 4: Pruebas
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "password": "admin123"
  }'
```

---

## 📚 Usuarios de Prueba

**Admin User** (pre-cargado en Auth Service):
```
Email: admin@example.com
Password: admin123
Role: admin
```

Puedes crear más usuarios con el endpoint `POST /api/v1/auth/create-user`.

---

## 🛡️ Seguridad Implementada

✅ **Contraseñas hasheadas** con bcryptjs (12 rounds)
✅ **JWT firmado** con HS256 algorithm
✅ **Validación de tokens** en cada solicitud
✅ **Rate limiting** en Auth Service (50 requests/15 min)
✅ **Validación de entrada** con express-validator
✅ **Control de acceso basado en roles** (RBAC)
✅ **Expiración de tokens** (7 días por defecto)
✅ **Errores diferenciados** (expirado vs inválido)

---

## 🔄 Flujo Completo de Ejemplo

1. **Usuario se registra o inicia sesión en Auth Service**
   ```
   POST /api/v1/auth/login → Obtiene TOKEN
   ```

2. **Usuario intenta crear otro usuario (requiere admin)**
   ```
   POST /api/usuarios
   Headers: Authorization: Bearer TOKEN
   → 403 Forbidden (no es admin)
   ```

3. **Admin inicia sesión**
   ```
   POST /api/v1/auth/login (admin@example.com) → Obtiene TOKEN_ADMIN
   ```

4. **Admin crea nuevo usuario**
   ```
   POST /api/usuarios
   Headers: Authorization: Bearer TOKEN_ADMIN
   → 201 Created (éxito)
   ```

5. **Usuario accede a su perfil**
   ```
   GET /api/usuarios/{id}
   Headers: Authorization: Bearer TOKEN
   → 200 OK (puede ver su perfil)
   ```

6. **Usuario intenta eliminar otro usuario**
   ```
   DELETE /api/usuarios/otro_id
   Headers: Authorization: Bearer TOKEN
   → 403 Forbidden (no es admin)
   ```

---

## 📞 Soporte

Si tienes problemas:

1. Verifica que JWT_SECRET sea igual en todos los servicios
2. Comprueba que los servicios estén corriendo en los puertos correctos
3. Asegúrate de incluir `Authorization: Bearer <token>` en el header
4. Revisa los logs: `docker-compose logs -f <servicio>`
5. Consulta ANALISIS_AUTENTICACION.md para más detalles técnicos

