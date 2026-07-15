import { Router } from 'express';
import { body } from 'express-validator';
import {
  register,
  login,
  perfil,
  verifyEmail,
  resendVerification,
  forgotPassword,
  resetPassword,
} from '../controllers/authController.js';
import { protegerRuta } from '../middlewares/auth.js';
import { authLimiter, emailLimiter } from '../middlewares/rateLimiter.js';

const router = Router();

// Validaciones para el registro
const validacionesRegistro = [
  body('nombre')
    .trim()
    .notEmpty()
    .withMessage('El nombre es obligatorio.')
    .isLength({ min: 2, max: 100 })
    .withMessage('El nombre debe tener entre 2 y 100 caracteres.'),
  body('email')
    .trim()
    .notEmpty()
    .withMessage('El correo electrónico es obligatorio.')
    .isEmail()
    .withMessage('El correo electrónico no tiene un formato válido.')
    .normalizeEmail(),
  body('password')
    .notEmpty()
    .withMessage('La contraseña es obligatoria.')
    .isLength({ min: 8 })
    .withMessage('La contraseña debe tener al menos 8 caracteres.')
    .matches(/\d/)
    .withMessage('La contraseña debe contener al menos un número.'),
];

// Validaciones para el login
const validacionesLogin = [
  body('email')
    .trim()
    .notEmpty()
    .withMessage('El correo electrónico es obligatorio.')
    .isEmail()
    .withMessage('El correo electrónico no tiene un formato válido.')
    .normalizeEmail(),
  body('password').notEmpty().withMessage('La contraseña es obligatoria.'),
];

// Validaciones para verificar email
const validacionesVerifyEmail = [
  body('token').trim().notEmpty().withMessage('El token de verificación es obligatorio.'),
];

// Validaciones para reenviar verificación
const validacionesResendVerification = [
  body('email')
    .trim()
    .notEmpty()
    .withMessage('El correo electrónico es obligatorio.')
    .isEmail()
    .withMessage('El correo electrónico no tiene un formato válido.')
    .normalizeEmail(),
];

// Validaciones para forgot password
const validacionesForgotPassword = [
  body('email')
    .trim()
    .notEmpty()
    .withMessage('El correo electrónico es obligatorio.')
    .isEmail()
    .withMessage('El correo electrónico no tiene un formato válido.')
    .normalizeEmail(),
];

// Validaciones para reset password
const validacionesResetPassword = [
  body('token').trim().notEmpty().withMessage('El token de recuperación es obligatorio.'),
  body('newPassword')
    .notEmpty()
    .withMessage('La nueva contraseña es obligatoria.')
    .isLength({ min: 8 })
    .withMessage('La nueva contraseña debe tener al menos 8 caracteres.')
    .matches(/\d/)
    .withMessage('La nueva contraseña debe contener al menos un número.'),
];

// POST /auth/register
router.post('/register', authLimiter, validacionesRegistro, register);

// POST /auth/login
router.post('/login', authLimiter, validacionesLogin, login);

// POST /auth/verify-email
router.post('/verify-email', authLimiter, validacionesVerifyEmail, verifyEmail);

// POST /auth/resend-verification
router.post(
  '/resend-verification',
  emailLimiter,
  validacionesResendVerification,
  resendVerification
);

// POST /auth/forgot-password
router.post('/forgot-password', emailLimiter, validacionesForgotPassword, forgotPassword);

// POST /auth/reset-password
router.post('/reset-password', authLimiter, validacionesResetPassword, resetPassword);

// GET /auth/perfil (ruta protegida de ejemplo)
router.get('/perfil', protegerRuta, perfil);

export default router;
