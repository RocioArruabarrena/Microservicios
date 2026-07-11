require('dotenv').config();
const jwt = require('jsonwebtoken');
const JwtService = require('../services/JwtService'); // ajustá may/min según tu archivo real


describe('JwtService', () => {
  const mockUser = {
    id: 1,
    email: 'test@mail.com',
    role: 'USER',
  };

  describe('generateToken', () => {
    it('debería generar un token correctamente', () => {
      const token = JwtService.generateToken(mockUser);
      expect(typeof token).toBe('string');
      expect(token.split('.')).toHaveLength(3);
    });

    it('el token generado debería tener el email del usuario', () => {
      const token = JwtService.generateToken(mockUser);
      const decoded = JwtService.decodeToken(token);
      expect(decoded.email).toBe(mockUser.email);
    });

    it('el token generado debería tener el id del usuario', () => {
      const token = JwtService.generateToken(mockUser);
      const decoded = JwtService.decodeToken(token);
      expect(decoded.id).toBe(mockUser.id);
    });

    it('el token generado debería tener tiempo de expiración', () => {
      const token = JwtService.generateToken(mockUser);
      const decoded = JwtService.decodeToken(token);
      expect(decoded.exp).toBeDefined();
      expect(decoded.iat).toBeDefined();
      expect(decoded.exp - decoded.iat).toBe(3600);
    });
  });

  describe('verifyToken', () => {
    it('un token válido debería verificarse correctamente', () => {
      const token = JwtService.generateToken(mockUser);
      const payload = JwtService.verifyToken(token);
      expect(payload.id).toBe(mockUser.id);
      expect(payload.email).toBe(mockUser.email);
      expect(payload.role).toBe(mockUser.role);
    });

    it('debería rechazar un token modificado', () => {
      const token = JwtService.generateToken(mockUser);
      const tokenModificado = token.slice(0, -1) + (token.slice(-1) === 'a' ? 'b' : 'a');
      expect(() => JwtService.verifyToken(tokenModificado)).toThrow();
    });

    it('debería rechazar un token vencido', () => {
      const tokenVencido = jwt.sign(
        { id: 1, email: 'test@mail.com', role: 'USER' },
        process.env.JWT_SECRET,
        { expiresIn: '-1s' }
      );
      expect(() => JwtService.verifyToken(tokenVencido)).toThrow('Token expirado');
    });

    it('debería rechazar un token firmado con otra clave secreta', () => {
      const tokenOtraClave = jwt.sign(
        { id: 1, email: 'test@mail.com', role: 'USER' },
        'otra-clave-totalmente-distinta',
        { expiresIn: '1h' }
      );
      expect(() => JwtService.verifyToken(tokenOtraClave)).toThrow('Token inválido');
    });
  });

  describe('decodeToken', () => {
    it('debería poder decodificar el token y leer su información', () => {
      const token = JwtService.generateToken(mockUser);
      const decoded = JwtService.decodeToken(token);
      expect(decoded).not.toBeNull();
      expect(decoded.id).toBe(mockUser.id);
      expect(decoded.email).toBe(mockUser.email);
      expect(decoded.role).toBe(mockUser.role);
      expect(decoded.exp).toBeDefined();
    });

    it('debería devolver null si el token es inválido', () => {
      const decoded = JwtService.decodeToken('esto-no-es-un-token-valido');
      expect(decoded).toBeNull();
    });
  });
});