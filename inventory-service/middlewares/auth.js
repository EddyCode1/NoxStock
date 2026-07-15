import jwt from 'jsonwebtoken';
import { errorResponse } from '../helpers/response.js';

export const validateJWT = (req, res, next) => {
  const secret = process.env.JWT_SECRET;

  if (!secret) {
    return errorResponse(res, 500, 'Configuración inválida: falta JWT_SECRET', 'MISSING_JWT_SECRET');
  }

  const authHeader = req.header('Authorization');
  const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null;

  if (!token) {
    return errorResponse(res, 401, 'No se proporcionó un token', 'MISSING_TOKEN');
  }

  try {
    const decoded = jwt.verify(token, secret);

    req.user = {
      id: decoded.sub || decoded.id || decoded._id,
      nombre: decoded.nombre,
      email: decoded.email,
    };

    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return errorResponse(res, 401, 'El token ha expirado', 'TOKEN_EXPIRED');
    }

    if (error.name === 'JsonWebTokenError') {
      return errorResponse(res, 401, 'Token inválido', 'INVALID_TOKEN');
    }

    return errorResponse(res, 500, 'Error al validar el token', 'TOKEN_VALIDATION_ERROR');
  }
};
