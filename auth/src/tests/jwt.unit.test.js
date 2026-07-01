/**
 * Tests UNITARIOS — Autenticación con JWT
 * Archivo: auth/src/tests/jwt.unit.test.js
 *
 * Diferencia con auth.test.js:
 *   - auth.test.js hace tests de INTEGRACIÓN (levanta la app con Supertest
 *     y pega contra los endpoints HTTP reales).
 *   - Este archivo hace tests UNITARIOS puros: se mockean `jsonwebtoken`,
 *     `bcryptjs` y `userStore`, y se llama directamente a las funciones
 *     del middleware y del controller (sin Express ni red de por medio).
 *     Esto aísla la lógica de JWT (firma, verificación, protección de rutas)
 *     de todo lo demás.
 *
 * Correr solo este archivo:
 *   npx jest src/tests/jwt.unit.test.js
 */

process.env.JWT_SECRET = 'test_secret_unitario_32_caracteres_ok';
process.env.JWT_EXPIRES_IN = '7d';

// Mockeamos las dependencias externas para que sean 100% controlables
jest.mock('jsonwebtoken');
jest.mock('bcryptjs');
jest.mock('../models/userStore');

const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const userStore = require('../models/userStore');
const { authenticate } = require('../middlewares/auth.middleware');
const { login, validateToken } = require('../controllers/auth.controller');

// Helper: mock de res estilo Express (status().json())
const mockRes = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

beforeEach(() => {
  jest.clearAllMocks();
});

// ─────────────────────────────────────────────
// 1. Middleware authenticate — protección de rutas con JWT
// ─────────────────────────────────────────────
describe('authenticate (middleware) — unidad', () => {
  let req, res, next;

  beforeEach(() => {
    req = { headers: {} };
    res = mockRes();
    next = jest.fn();
  });

  it('devuelve 401 si no viene el header Authorization', () => {
    authenticate(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ success: false, message: 'Token de autenticación requerido' })
    );
    expect(next).not.toHaveBeenCalled();
    expect(jwt.verify).not.toHaveBeenCalled();
  });

  it('devuelve 401 si el header no empieza con "Bearer "', () => {
    req.headers.authorization = 'Token abc123';

    authenticate(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
  });

  it('llama a jwt.verify con el token extraído y el JWT_SECRET correcto', () => {
    req.headers.authorization = 'Bearer mi.token.jwt';
    jwt.verify.mockReturnValue({ id: 'user-1' });
    userStore.findById.mockReturnValue({ id: 'user-1' });

    authenticate(req, res, next);

    expect(jwt.verify).toHaveBeenCalledWith('mi.token.jwt', process.env.JWT_SECRET);
  });

  it('devuelve 401 "Token inválido o expirado" si jwt.verify lanza error', () => {
    req.headers.authorization = 'Bearer token.roto.o.vencido';
    jwt.verify.mockImplementation(() => {
      throw new Error('jwt expired');
    });

    authenticate(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ success: false, message: 'Token inválido o expirado' })
    );
    expect(next).not.toHaveBeenCalled();
  });

  it('devuelve 401 "Usuario no encontrado" si el id del payload no existe en el store', () => {
    req.headers.authorization = 'Bearer token.valido.pero.usuario.borrado';
    jwt.verify.mockReturnValue({ id: 'user-fantasma' });
    userStore.findById.mockReturnValue(null);

    authenticate(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ success: false, message: 'Usuario no encontrado' })
    );
    expect(next).not.toHaveBeenCalled();
  });

  it('adjunta req.authUser y llama a next() cuando el token y el usuario son válidos', () => {
    const usuarioMock = { id: 'user-1', name: 'Rocío', email: 'rocio@example.com', role: 'user' };
    req.headers.authorization = 'Bearer token.valido';
    jwt.verify.mockReturnValue({ id: 'user-1', email: 'rocio@example.com', role: 'user' });
    userStore.findById.mockReturnValue(usuarioMock);

    authenticate(req, res, next);

    expect(req.authUser).toEqual(usuarioMock);
    expect(next).toHaveBeenCalledTimes(1);
    expect(res.status).not.toHaveBeenCalled();
  });
});

// ─────────────────────────────────────────────
// 2. login → generación del JWT (generateToken es interno,
//    se testea a través del controller)
// ─────────────────────────────────────────────
describe('login (controller) — generación de JWT — unidad', () => {
  let req, res, next;

  beforeEach(() => {
    req = { body: { email: 'rocio@example.com', password: 'Password123' } };
    res = mockRes();
    next = jest.fn();
  });

  it('firma el token con { id, email, role } usando JWT_SECRET y expiresIn del env', async () => {
    const usuarioHasheado = {
      id: 'user-42',
      name: 'Rocío',
      email: 'rocio@example.com',
      password: 'hash-simulado',
      role: 'admin',
    };
    userStore.findByEmail.mockReturnValue(usuarioHasheado);
    userStore.toPublic.mockReturnValue({
      id: 'user-42',
      name: 'Rocío',
      email: 'rocio@example.com',
      role: 'admin',
    });
    bcrypt.compare.mockResolvedValue(true);
    jwt.sign.mockReturnValue('token-firmado-123');

    await login(req, res, next);

    expect(jwt.sign).toHaveBeenCalledWith(
      { id: 'user-42', email: 'rocio@example.com', role: 'admin' },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: true,
        data: expect.objectContaining({ token: 'token-firmado-123' }),
      })
    );
  });

  it('NO genera token y devuelve 401 si la contraseña no coincide', async () => {
    userStore.findByEmail.mockReturnValue({
      id: 'user-42',
      password: 'hash-simulado',
      email: 'rocio@example.com',
      role: 'user',
    });
    bcrypt.compare.mockResolvedValue(false);

    await login(req, res, next);

    expect(jwt.sign).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: false }));
  });

  it('NO genera token y devuelve 401 si el email no existe', async () => {
    userStore.findByEmail.mockReturnValue(null);

    await login(req, res, next);

    expect(jwt.sign).not.toHaveBeenCalled();
    expect(bcrypt.compare).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(401);
  });
});

// ─────────────────────────────────────────────
// 3. validateToken → verificación del JWT
// ─────────────────────────────────────────────
describe('validateToken (controller) — verificación de JWT — unidad', () => {
  let req, res, next;

  beforeEach(() => {
    res = mockRes();
    next = jest.fn();
  });

  it('responde valid:true con el payload decodificado cuando el token es correcto', () => {
    req = { body: { token: 'token-valido' } };
    jwt.verify.mockReturnValue({ id: 'user-1', email: 'rocio@example.com', role: 'user' });
    userStore.findById.mockReturnValue({ id: 'user-1', email: 'rocio@example.com', role: 'user' });
    userStore.toPublic.mockReturnValue({ id: 'user-1', email: 'rocio@example.com', role: 'user' });

    validateToken(req, res, next);

    expect(jwt.verify).toHaveBeenCalledWith('token-valido', process.env.JWT_SECRET);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: true,
        data: expect.objectContaining({
          valid: true,
          payload: expect.objectContaining({ id: 'user-1', role: 'user' }),
        }),
      })
    );
  });

  it('responde 401 y valid:false si jwt.verify lanza error (token roto/expirado)', () => {
    req = { body: { token: 'token-roto' } };
    jwt.verify.mockImplementation(() => {
      throw new Error('invalid signature');
    });

    validateToken(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ success: false, data: { valid: false } })
    );
  });

  it('responde 400 y no llama a jwt.verify si no se envía token', () => {
    req = { body: {} };

    validateToken(req, res, next);

    expect(jwt.verify).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: false }));
  });
});