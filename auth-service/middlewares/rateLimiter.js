import rateLimit from 'express-rate-limit';

/**
 * Limitador de peticiones para las rutas de autenticación (register/login),
 * ayuda a mitigar ataques de fuerza bruta.
 */
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: process.env.NODE_ENV === 'development' ? 200 : 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Demasiados intentos. Por favor intenta nuevamente en unos minutos.',
  },
});

export default authLimiter;
