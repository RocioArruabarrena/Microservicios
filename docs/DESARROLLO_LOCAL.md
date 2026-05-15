# 🛠️ Guía de Desarrollo Local

## 📋 Requisitos

- Node.js 18+ 
- npm o yarn
- MongoDB local (O usar Docker solo para MongoDB)

## 🚀 Configuración Local Sin Docker

### 1. Instalar MongoDB localmente

#### En Windows (Descarga)
1. Ir a https://www.mongodb.com/try/download/community
2. Descargar Windows MSI
3. Instalar con MongoDB Compass (GUI opcional)
4. Ejecutar: `mongod` en terminal

#### Alternativa: Usar Docker solo para BD
```bash
docker run -d -p 27017:27017 -e MONGO_INITDB_ROOT_USERNAME=admin -e MONGO_INITDB_ROOT_PASSWORD=password mongo
```

### 2. Usuario Service

```bash
cd usuario-service

# Instalar dependencias
npm install

# Crear .env local (ya existe, pero verifica)
cat .env

# Iniciar servicio
npm start
# Verá: 🚀 Usuario Service ejecutándose en puerto 3001
```

**En otra terminal:**

### 3. Pedido Service

```bash
cd pedido-service

# Instalar dependencias
npm install

# Verificar .env (editar USUARIO_SERVICE_URL si es necesario)
# USUARIO_SERVICE_URL=http://localhost:3001

# Iniciar servicio
npm start
# Verá: 🚀 Pedido Service ejecutándose en puerto 3002
```

---

## 📚 URLs Locales

```
Usuarios Swagger: http://localhost:3001/api-docs
Pedidos Swagger:  http://localhost:3002/api-docs
MongoDB:          localhost:27017
```

---

## 🔄 Desarrollo Continuo (Con nodemon)

Para desarrollo con recarga automática:

```bash
# En lugar de: npm start
npm run dev

# Esto ejecutará: nodemon server.js
# Se reinicia automáticamente cuando cambias archivos
```

---

## 📝 Variables de Entorno Locales

### usuario-service/.env
```
MONGODB_URI=mongodb://admin:password@localhost:27017/usuarios?authSource=admin
PORT=3001
```

### pedido-service/.env
```
MONGODB_URI=mongodb://admin:password@localhost:27017/pedidos?authSource=admin
PORT=3002
USUARIO_SERVICE_URL=http://localhost:3001
```

---

## 🧪 Testing Local

### Terminal 1: MongoDB
```bash
mongod
# Output: Listening on 27017
```

### Terminal 2: Usuario Service
```bash
cd usuario-service
npm run dev
# Output: 🚀 Usuario Service ejecutándose en puerto 3001
```

### Terminal 3: Pedido Service
```bash
cd pedido-service
npm run dev
# Output: 🚀 Pedido Service ejecutándose en puerto 3002
```

### Terminal 4: Testing (curl/Postman)
```bash
# Probar creación de usuario
curl -X POST http://localhost:3001/api/usuarios \
  -H "Content-Type: application/json" \
  -d '{"nombre":"Test","email":"test@test.com","contraseña":"pass","telefono":"123"}'
```

---

## 🐛 Debugging

### Ver logs detallados

**Opción 1: Aumentar verbosidad en server.js**
```javascript
// Agregar al inicio de server.js
if (process.env.DEBUG) {
  mongoose.set('debug', true);
}
```

Ejecutar con:
```bash
DEBUG=true npm run dev
```

**Opción 2: Usar Chrome DevTools**
```bash
node --inspect server.js
```

Luego en Chrome: `chrome://inspect`

### Verificar conexión MongoDB

```bash
mongosh
> use usuarios
> db.usuarios.find()

> use pedidos
> db.pedidos.find()
```

---

## 🔄 Hot Reload

Si quieres automáticamente reiniciar servicios al cambiar código:

```bash
# Instalar nodemon globalmente
npm install -g nodemon

# Ejecutar con nodemon
nodemon server.js

# O usa npm run dev (ya configurado en package.json)
npm run dev
```

---

## 📊 Estructura típica de desarrollo

```
MicroServicios/
├── usuario-service/
│   ├── .env (mongodb local)
│   ├── server.js
│   ├── package.json
│   └── models/routes/controllers
│
└── pedido-service/
    ├── .env (mongodb local)
    ├── server.js
    ├── package.json
    └── models/routes/controllers
```

---

## 🚀 Flujo de Desarrollo Típico

1. Modificas `usuario-service/routes/usuarios.js`
2. Nodemon detecta cambio
3. Servicio se reinicia automáticamente
4. Actualizas tus requests en Postman/curl
5. Pruebas el cambio
6. Ves resultados en Swagger UI

---

## 🔧 Troubleshooting

### Puerto ya está en uso

```bash
# Encontrar proceso usando puerto 3001
netstat -ano | findstr :3001

# Matar proceso
taskkill /PID <PID> /F

# O cambiar puerto en .env
PORT=3003
```

### MongoDB error: connect ECONNREFUSED

```bash
# Verificar que MongoDB está corriendo
mongosh

# Si no funciona, iniciar MongoDB
mongod

# O en Docker
docker run -d -p 27017:27017 mongo
```

### Error de CORS

Verificar que servidor tiene CORS habilitado:
```javascript
const cors = require('cors');
app.use(cors()); // Agregado en server.js
```

### Cambios no se reflejan

- Verifica que usas `npm run dev` (nodemon)
- Revisa que .env tiene variables correctas
- Reinicia manual: Ctrl+C y `npm run dev` nuevamente

---

## 📦 Dependencias Principales

```json
{
  "express": "Servidor HTTP",
  "mongoose": "ODM para MongoDB",
  "axios": "Cliente HTTP para inter-servicios",
  "swagger-jsdoc": "Genera spec OpenAPI",
  "swagger-ui-express": "Interfaz Swagger UI",
  "cors": "Habilita CORS",
  "dotenv": "Variables de entorno",
  "nodemon": "Auto-reload en desarrollo"
}
```

---

## ✅ Checklist de Desarrollo

- [ ] MongoDB corriendo en puerto 27017
- [ ] Usuario Service corriendo en puerto 3001
- [ ] Pedido Service corriendo en puerto 3002
- [ ] Acceso a http://localhost:3001/api-docs
- [ ] Acceso a http://localhost:3002/api-docs
- [ ] Creación de usuario exitosa
- [ ] Creación de pedido verificando usuario
- [ ] Cambio de estado de pedido
- [ ] Obtener pedidos por usuario
- [ ] Logs sin errores en consola

---
