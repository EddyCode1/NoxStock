import { verifyJwt } from '../helpers/generateJwt.js';
import User from '../models/User.js';

/**
 * Middleware para proteger rutas mediante JWT.
 * Espera el token en el header: Authorization: Bearer <token>
 */
export const protegerRuta = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'No autorizado. Token no proporcionado.',
      });
    }

    const token = authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'No autorizado. Token no proporcionado.',
      });
    }

    let decoded;
    try {
      decoded = verifyJwt(token);
    } catch (error) {
      const message =
        error.name === 'TokenExpiredError'
          ? 'El token ha expirado.'
          : 'Token inválido.';
      return res.status(401).json({ success: false, message });
    }

    const usuario = await User.findById(decoded.id);

    if (!usuario || !usuario.activo) {
      return res.status(401).json({
        success: false,
        message: 'El usuario asociado al token no existe o está inactivo.',
      });
    }

    // Adjuntar el usuario a la request para uso en los siguientes middlewares/controladores
    req.usuario = usuario;
    req.usuarioId = usuario._id;

    next();
  } catch (error) {
    console.error('Error en middleware de autenticación:', error);
    return res.status(500).json({
      success: false,
      message: 'Error interno al validar la autenticación.',
    });
  }
};

/**
 * Middleware para restringir acceso según el rol del usuario.
 * Uso: autorizarRoles('admin')
 */
export const autorizarRoles = (...rolesPermitidos) => {
  return (req, res, next) => {
    if (!req.usuario || !rolesPermitidos.includes(req.usuario.role)) {
      return res.status(403).json({
        success: false,
        message: 'No tienes permisos para realizar esta acción.',
      });
    }
    next();
  };
};

export default protegerRuta;
