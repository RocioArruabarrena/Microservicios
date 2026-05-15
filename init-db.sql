-- Crear bases de datos
CREATE DATABASE usuarios;
CREATE DATABASE pedidos;

-- Conectar a la base de datos usuarios
\c usuarios;

-- Crear tabla usuarios
CREATE TABLE usuarios (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    contraseña VARCHAR(255) NOT NULL,
    telefono VARCHAR(20),
    activo BOOLEAN DEFAULT TRUE,
    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Conectar a la base de datos pedidos
\c pedidos;

-- Crear tabla pedidos
CREATE TABLE pedidos (
    id SERIAL PRIMARY KEY,
    "usuarioId" INTEGER NOT NULL,
    productos JSONB NOT NULL,
    estado VARCHAR(50) DEFAULT 'pendiente',
    total FLOAT NOT NULL,
    direccion VARCHAR(255),
    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Crear índices para mejor rendimiento
CREATE INDEX idx_pedidos_usuario ON pedidos("usuarioId");
CREATE INDEX idx_pedidos_estado ON pedidos(estado);
