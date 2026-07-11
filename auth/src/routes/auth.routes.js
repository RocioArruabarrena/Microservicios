const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { createUser, login, validateToken, getMe } = require('../controllers/auth.controller');
const { authenticate } = require('../middlewares/auth.middleware');
const validateRequest = require('../middlewares/validateRequest');

/**
 * @swagger
 * /auth/create-user:
 *   post:
 *     tags: [Auth]
 *     summary: Crear nuevo usuario
 *     description: |
 *       Registra un usuario nuevo en el Auth Service (almacenado en memoria).
 *       Retorna un token JWT listo para usar.
 *
 *       **Nota:** Los usuarios creados aquí son independientes del User Service.
 *       El token generado puede usarse para autenticar requests en User Service y Order Service.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateUserRequest'
 *           example:
 *             name: María García
 *             email: maria@example.com
 *             password: Secret123!
 *             role: user
 *     responses:
 *       201:
 *         description: Usuario creado y token generado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/TokenResponse'
 *       409:
 *         description: Email ya registrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       400:
 *         description: Datos de entrada inválidos
 */
router.post(
  '/create-user',
  [
    body('name').trim().isLength({ min: 2, max: 100 }).withMessage('Nombre entre 2 y 100 caracteres'),
    body('email').isEmail().normalizeEmail().withMessage('Email inválido'),
    body('password').isLength({ min: 6 }).withMessage('Contraseña mínimo 6 caracteres'),
    body('role').optional().isIn(['user', 'admin']).withMessage('Rol inválido: user | admin'),
  ],
  validateRequest,
  createUser
);

/**
 * @swagger
 * /auth/login:
 *   post:
 *     tags: [Auth]
 *     summary: Iniciar sesión y obtener token JWT
 *     description: |
 *       Autentica al usuario y emite un token JWT firmado con `JWT_SECRET`.
 *
 *       El token contiene:
 *       - `id` — identificador del usuario
 *       - `email` — correo electrónico
 *       - `role` — rol (`user` | `admin`)
 *       - `iat` / `exp` — fechas de emisión y expiración
 *
 *       **Usuarios de prueba:**
 *       | Email | Password | Rol |
 *       |-------|----------|-----|
 *       | admin@example.com | admin123 | admin |
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LoginRequest'
 *           example:
 *             email: admin@example.com
 *             password: admin123
 *     responses:
 *       200:
 *         description: Login exitoso, token JWT emitido
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/TokenResponse'
 *             example:
 *               success: true
 *               message: Login exitoso
 *               data:
 *                 token: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 *                 expiresIn: 7d
 *                 user:
 *                   id: seed-admin-001
 *                   name: Admin
 *                   email: admin@example.com
 *                   role: admin
 *       401:
 *         description: Credenciales inválidas
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.post(
  '/login',
  [
    body('email').isEmail().normalizeEmail().withMessage('Email inválido'),
    body('password').notEmpty().withMessage('Contraseña requerida'),
  ],
  validateRequest,
  login
);

/**
 * @swagger
 * /auth/validate-token:
 *   post:
 *     tags: [Auth]
 *     summary: Validar token JWT
 *     description: |
 *       Verifica si un token JWT es válido. Útil para que otros servicios
 *       verifiquen tokens sin necesidad de la clave secreta directamente.
 *
 *       También puede usarse en tests para confirmar que un token es correcto.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ValidateTokenRequest'
 *     responses:
 *       200:
 *         description: Resultado de la validación
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean }
 *                 message: { type: string }
 *                 data:
 *                   type: object
 *                   properties:
 *                     valid: { type: boolean }
 *                     payload:
 *                       type: object
 *                       properties:
 *                         id: { type: string }
 *                         email: { type: string }
 *                         role: { type: string }
 *                         iat: { type: integer }
 *                         exp: { type: integer }
 *       401:
 *         description: Token inválido o expirado
 */
router.post(
  '/validate-token',
  [body('token').notEmpty().withMessage('Token requerido')],
  validateRequest,
  validateToken
);

/**
 * @swagger
 * /auth/me:
 *   get:
 *     tags: [Auth]
 *     summary: Obtener perfil del usuario autenticado
 *     description: Retorna la información del usuario dueño del token.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Perfil obtenido
 *       401:
 *         description: No autenticado
 */
router.get('/me', authenticate, getMe);



/**
 * @swagger
 * /auth/profile:
 *   get:
 *     tags: [Auth]
 *     summary: Obtener datos del usuario desde el token JWT
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Datos extraídos del token
 *       401:
 *         description: No autenticado
 */
router.get('/profile', authenticate, (req, res) => {
  const { id, email, role } = req.authUser;
  res.json({ id, email, role });
});

module.exports = router;
