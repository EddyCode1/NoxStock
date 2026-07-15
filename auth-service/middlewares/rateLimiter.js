import rateLimit from 'express-rate-limit';

/**
 * Limitador de peticiones para las rutas de autenticación (register/login),
 * ayuda a mitigar ataques de fuerza bruta.
 */
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 20, // máximo 20 intentos por IP en la ventana de tiempo
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Demasiados intentos. Por favor intenta nuevamente en unos minutos.',
  },
});

export default authLimiter;
