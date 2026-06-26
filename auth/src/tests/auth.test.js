/**
 * Tests unitarios — Auth Service
 * Archivo: auth/src/tests/auth.test.js
 *
 * Setup:
 *   cd auth
 *   npm install --save-dev jest supertest
 *   # En package.json agregar: "test": "jest --forceExit"
 *
 * Correr: npm test
 *
 * IMPORTANTE: el app.js llama a app.listen() al importarse.
 * Para evitar conflictos de puerto en tests, Supertest maneja
 * su propio servidor interno — no hace falta levantar el servicio.
 *
 * Variables de entorno necesarias (o se usan defaults):
 *   JWT_SECRET=test_secret_para_jest_minimo_32_caracteres_ok
 *   JWT_EXPIRES_IN=7d
 *   API_VERSION=v1
 */

process.env.JWT_SECRET = 'test_secret_para_jest_minimo_32_caracteres_ok';
process.env.JWT_EXPIRES_IN = '7d';
process.env.API_VERSION = 'v1';

const request = require('supertest');
const app = require('../src/app');

// Base URL del auth service
const BASE = '/api/v1/auth';

// ─────────────────────────────────────────────
// Helper: crear un usuario único por test
// ─────────────────────────────────────────────
let userCounter = 0;
const nuevoUsuario = (overrides = {}) => {
  userCounter++;
  return {
    name: `Test User ${userCounter}`,
    email: `testuser${userCounter}_${Date.now()}@example.com`,
    password: 'Password123',
    role: 'user',
    ...overrides,
  };
};

// ─────────────────────────────────────────────
// 1. POST /create-user
// ─────────────────────────────────────────────
describe('POST /create-user', () => {
  it('crea un usuario nuevo y devuelve 201 con token', async () => {
    const datos = nuevoUsuario();
    const res = await request(app).post(`${BASE}/create-user`).send(datos);

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty('token');
    expect(res.body.data.user).toMatchObject({
      name: datos.name,
      email: datos.email,
      role: 'user',
    });
    // No debe exponer la contraseña
    expect(res.body.data.user).not.toHaveProperty('password');
  });

  it('devuelve 409 si el email ya está registrado', async () => {
    const datos = nuevoUsuario();
    // Primer registro
    await request(app).post(`${BASE}/create-user`).send(datos);
    // Segundo intento con el mismo email
    const res = await request(app).post(`${BASE}/create-user`).send(datos);

    expect(res.status).toBe(409);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toMatch(/ya está registrado/i);
  });

  it('devuelve 400 si falta el campo email', async () => {
    const res = await request(app).post(`${BASE}/create-user`).send({
      name: 'Sin Email',
      password: 'Password123',
    });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it('devuelve 400 si falta el campo password', async () => {
    const res = await request(app).post(`${BASE}/create-user`).send({
      name: 'Sin Password',
      email: 'sinpass@example.com',
    });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it('devuelve 400 si el email tiene formato inválido', async () => {
    const res = await request(app).post(`${BASE}/create-user`).send({
      name: 'Email Roto',
      email: 'no-es-un-email',
      password: 'Password123',
    });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it('devuelve 400 si la contraseña tiene menos de 6 caracteres', async () => {
    const res = await request(app).post(`${BASE}/create-user`).send({
      name: 'Clave Corta',
      email: 'clavecorta@example.com',
      password: '123',
    });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it('devuelve 400 si el rol es inválido', async () => {
    const res = await request(app).post(`${BASE}/create-user`).send({
      name: 'Rol Raro',
      email: 'rolraro@example.com',
      password: 'Password123',
      role: 'superadmin',
    });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it('acepta rol admin al crear usuario', async () => {
    const datos = nuevoUsuario({ role: 'admin' });
    const res = await request(app).post(`${BASE}/create-user`).send(datos);

    expect(res.status).toBe(201);
    expect(res.body.data.user.role).toBe('admin');
  });
});

// ─────────────────────────────────────────────
// 2. POST /login
// ─────────────────────────────────────────────
describe('POST /login', () => {
  it('login exitoso con usuario admin seeded devuelve token', async () => {
    // El userStore siembra admin@example.com / admin123 al arrancar
    // Puede tardar un tick en hashearse, por eso esperamos
    await new Promise((r) => setTimeout(r, 500));

    const res = await request(app).post(`${BASE}/login`).send({
      email: 'admin@example.com',
      password: 'admin123',
    });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty('token');
    expect(res.body.data.user.role).toBe('admin');
  });

  it('login exitoso con usuario recién creado', async () => {
    const datos = nuevoUsuario();
    await request(app).post(`${BASE}/create-user`).send(datos);

    const res = await request(app).post(`${BASE}/login`).send({
      email: datos.email,
      password: datos.password,
    });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty('token');
  });

  it('devuelve 401 con contraseña incorrecta', async () => {
    const datos = nuevoUsuario();
    await request(app).post(`${BASE}/create-user`).send(datos);

    const res = await request(app).post(`${BASE}/login`).send({
      email: datos.email,
      password: 'ContrasenaWrong99',
    });

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toMatch(/credenciales inválidas/i);
  });

  it('devuelve 401 con email inexistente', async () => {
    const res = await request(app).post(`${BASE}/login`).send({
      email: 'noexiste@example.com',
      password: 'Password123',
    });

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  it('devuelve 400 si falta el email', async () => {
    const res = await request(app).post(`${BASE}/login`).send({
      password: 'Password123',
    });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it('devuelve 400 si falta la contraseña', async () => {
    const res = await request(app).post(`${BASE}/login`).send({
      email: 'admin@example.com',
    });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });
});

// ─────────────────────────────────────────────
// 3. POST /validate-token
// ─────────────────────────────────────────────
describe('POST /validate-token', () => {
  let tokenValido;

  beforeAll(async () => {
    await new Promise((r) => setTimeout(r, 500));
    const res = await request(app).post(`${BASE}/login`).send({
      email: 'admin@example.com',
      password: 'admin123',
    });
    tokenValido = res.body.data?.token;
  });

  it('valida un token válido y devuelve payload', async () => {
    const res = await request(app)
      .post(`${BASE}/validate-token`)
      .send({ token: tokenValido });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.valid).toBe(true);
    expect(res.body.data.payload).toHaveProperty('id');
    expect(res.body.data.payload).toHaveProperty('email', 'admin@example.com');
    expect(res.body.data.payload).toHaveProperty('role', 'admin');
  });

  it('devuelve 401 con token inválido (string basura)', async () => {
    const res = await request(app)
      .post(`${BASE}/validate-token`)
      .send({ token: 'esto.no.es.un.token' });

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
    expect(res.body.data.valid).toBe(false);
  });

  it('devuelve 400 si no se envía token', async () => {
    const res = await request(app)
      .post(`${BASE}/validate-token`)
      .send({});

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });
});

// ─────────────────────────────────────────────
// 4. GET /me
// ─────────────────────────────────────────────
describe('GET /me', () => {
  let tokenValido;

  beforeAll(async () => {
    await new Promise((r) => setTimeout(r, 500));
    const res = await request(app).post(`${BASE}/login`).send({
      email: 'admin@example.com',
      password: 'admin123',
    });
    tokenValido = res.body.data?.token;
  });

  it('devuelve el perfil del usuario autenticado', async () => {
    const res = await request(app)
      .get(`${BASE}/me`)
      .set('Authorization', `Bearer ${tokenValido}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.user).toMatchObject({
      email: 'admin@example.com',
      role: 'admin',
    });
    expect(res.body.data.user).not.toHaveProperty('password');
  });

  it('devuelve 401 sin header Authorization', async () => {
    const res = await request(app).get(`${BASE}/me`);

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  it('devuelve 401 con token mal formado', async () => {
    const res = await request(app)
      .get(`${BASE}/me`)
      .set('Authorization', 'Bearer tokenbasura123');

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  it('devuelve 401 si el header no empieza con Bearer', async () => {
    const res = await request(app)
      .get(`${BASE}/me`)
      .set('Authorization', tokenValido); // sin "Bearer "

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });
});

// ─────────────────────────────────────────────
// 5. GET /health
// ─────────────────────────────────────────────
describe('GET /health', () => {
  it('responde 200 con status OK', async () => {
    const res = await request(app).get('/health');

    expect(res.status).toBe(200);
    expect(res.body.status).toBe('OK');
    expect(res.body).toHaveProperty('timestamp');
  });
});

// ─────────────────────────────────────────────
// 6. Rutas inexistentes
// ─────────────────────────────────────────────
describe('404 - Endpoint no encontrado', () => {
  it('devuelve 404 para rutas que no existen', async () => {
    const res = await request(app).get('/api/v1/auth/ruta-inventada');

    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toMatch(/no encontrado/i);
  });
});