/**
 * Middleware de autenticación JWT compartido.
 * Valida el token emitido por el Auth Service usando la JWT_SECRET compartida.
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

const internalAuth = (req, res, next) => {
  const serviceKey = req.headers['x-service-key'];
  if (serviceKey !== process.env.INTERNAL_SERVICE_KEY) {
    return res.status(403).json({ success: false, message: 'Acceso interno no autorizado' });
  }
  next();
};

module.exports = { authenticate, authorize, internalAuth };