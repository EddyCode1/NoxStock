import { Router } from 'express';
import { body } from 'express-validator';
import { register, login, perfil } from '../controllers/authController.js';
import { protegerRuta } from '../middlewares/auth.js';
import { authLimiter } from '../middlewares/rateLimiter.js';

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

// POST /auth/register
router.post('/register', authLimiter, validacionesRegistro, register);

// POST /auth/login
router.post('/login', authLimiter, validacionesLogin, login);

// GET /auth/perfil (ruta protegida de ejemplo)
router.get('/perfil', protegerRuta, perfil);

export default router;
