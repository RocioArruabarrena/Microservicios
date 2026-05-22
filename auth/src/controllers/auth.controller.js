const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const userStore = require('../models/userStore');

const generateToken = (user) => {
  return jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
};

// POST /create-user
const createUser = async (req, res, next) => {
  try {
    const { name, email, password, role } = req.body;

    const existing = userStore.findByEmail(email);
    if (existing) {
      return res.status(409).json({ success: false, message: 'El email ya está registrado' });
    }

    const user = await userStore.create({ name, email, password, role });
    const token = generateToken(user);

    res.status(201).json({
      success: true,
      message: 'Usuario creado exitosamente',
      data: {
        token,
        expiresIn: process.env.JWT_EXPIRES_IN || '7d',
        user: userStore.toPublic(user),
      },
    });
  } catch (error) {
    next(error);
  }
};

// POST /login
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = userStore.findByEmail(email);
    if (!user) {
      return res.status(401).json({ success: false, message: 'Credenciales inválidas' });
    }

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      return res.status(401).json({ success: false, message: 'Credenciales inválidas' });
    }

    const token = generateToken(user);

    res.json({
      success: true,
      message: 'Login exitoso',
      data: {
        token,
        expiresIn: process.env.JWT_EXPIRES_IN || '7d',
        user: userStore.toPublic(user),
      },
    });
  } catch (error) {
    next(error);
  }
};

// POST /validate-token  (para uso interno entre servicios)
const validateToken = (req, res, next) => {
  try {
    const { token } = req.body;
    if (!token) {
      return res.status(400).json({ success: false, message: 'Token requerido' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = userStore.findById(decoded.id);

    res.json({
      success: true,
      message: 'Token válido',
      data: { valid: true, payload: decoded, user: userStore.toPublic(user) },
    });
  } catch (error) {
    res.status(401).json({
      success: false,
      message: 'Token inválido o expirado',
      data: { valid: false },
    });
  }
};

// GET /me
const getMe = (req, res) => {
  res.json({ success: true, data: { user: userStore.toPublic(req.authUser) } });
};

module.exports = { createUser, login, validateToken, getMe };
