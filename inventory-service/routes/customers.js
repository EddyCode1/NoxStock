import { Router } from 'express';
import { body, param, query } from 'express-validator';
import {
  createCustomer,
  deleteCustomer,
  getCustomerById,
  getCustomers,
  updateCustomer,
} from '../controllers/customerController.js';
import { validateJWT } from '../middlewares/auth.js';
import { handleValidationErrors } from '../middlewares/validators.js';

const router = Router();

router.use(validateJWT);

router.get(
  '/',
  [
    query('q').optional().isString().trim().isLength({ max: 120 }),
    query('activo').optional().isIn(['true', 'false']),
    handleValidationErrors,
  ],
  getCustomers
);

router.get(
  '/:id',
  [param('id').isMongoId().withMessage('ID de cliente inválido'), handleValidationErrors],
  getCustomerById
);

router.post(
  '/',
  [
    body('nombre').trim().notEmpty().withMessage('El nombre es obligatorio').isLength({ max: 120 }),
    body('email').optional().isString().trim().isLength({ max: 120 }),
    body('telefono').optional().isString().trim().isLength({ max: 30 }),
    body('nit').optional().isString().trim().isLength({ max: 20 }),
    body('activo').optional().isBoolean(),
    handleValidationErrors,
  ],
  createCustomer
);

router.put(
  '/:id',
  [
    param('id').isMongoId().withMessage('ID de cliente inválido'),
    body('nombre').optional().trim().notEmpty().isLength({ max: 120 }),
    body('email').optional().isString().trim().isLength({ max: 120 }),
    body('telefono').optional().isString().trim().isLength({ max: 30 }),
    body('nit').optional().isString().trim().isLength({ max: 20 }),
    body('activo').optional().isBoolean(),
    handleValidationErrors,
  ],
  updateCustomer
);

router.delete(
  '/:id',
  [param('id').isMongoId().withMessage('ID de cliente inválido'), handleValidationErrors],
  deleteCustomer
);

export default router;
