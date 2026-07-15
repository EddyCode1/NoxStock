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

/**
 * Limitador más restrictivo para endpoints que disparan envío de correos
 * (resend-verification, forgot-password), para evitar abuso/spam.
 */
export const emailLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 5, // máximo 5 solicitudes por IP en la ventana de tiempo
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message:
      'Demasiadas solicitudes de correo. Por favor intenta nuevamente en unos minutos.',
  },
});

export default authLimiter;
