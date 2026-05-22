/**
 * Middleware JWT para validar autenticación
 * Valida tokens emitidos por el Auth Service
 */
const jwt = require('jsonwebtoken');

const authenticate = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      message: 'Token requerido. Obtenelo en POST /api/v1/auth/login del Auth Service.',
    });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // { id, email, role, iat, exp }
    next();
  } catch (err) {
    const message =
      err.name === 'TokenExpiredError'
        ? 'Token expirado. Iniciá sesión nuevamente.'
        : 'Token inválido. Debe ser emitido por el Auth Service.';
    return res.status(401).json({ success: false, message });
  }
};

const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Acceso denegado. Rol requerido: ${roles.join(' o ')}.`,
      });
    }
    next();
  };
};

module.exports = { authenticate, authorize };
