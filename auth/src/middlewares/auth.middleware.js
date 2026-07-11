const JwtService = require('../services/JwtService');
const userStore = require('../models/userStore');

const authenticate = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, message: 'Token de autenticación requerido' });
  }

  try {
    const token = authHeader.split(' ')[1];
    const decoded = JwtService.verifyToken(token);
    const user = userStore.findById(decoded.id);
    if (!user) {
      return res.status(401).json({ success: false, message: 'Usuario no encontrado' });
    }
    req.authUser = user;
    next();
  } catch {
    return res.status(401).json({ success: false, message: 'Token inválido o expirado' });
  }
};

module.exports = { authenticate };