import { Router } from 'express';
import { body, param, query } from 'express-validator';
import {
  createSupplier,
  deleteSupplier,
  getSupplierById,
  getSuppliers,
  updateSupplier,
} from '../controllers/supplierController.js';
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
  getSuppliers
);

router.get(
  '/:id',
  [param('id').isMongoId().withMessage('ID de proveedor inválido'), handleValidationErrors],
  getSupplierById
);

router.post(
  '/',
  [
    body('nombre').trim().notEmpty().withMessage('El nombre es obligatorio').isLength({ max: 120 }),
    body('contacto').optional().isString().trim().isLength({ max: 100 }),
    body('email').optional().isString().trim().isLength({ max: 120 }),
    body('telefono').optional().isString().trim().isLength({ max: 30 }),
    body('categorias').optional().isArray(),
    body('activo').optional().isBoolean(),
    handleValidationErrors,
  ],
  createSupplier
);

router.put(
  '/:id',
  [
    param('id').isMongoId().withMessage('ID de proveedor inválido'),
    body('nombre').optional().trim().notEmpty().isLength({ max: 120 }),
    body('contacto').optional().isString().trim().isLength({ max: 100 }),
    body('email').optional().isString().trim().isLength({ max: 120 }),
    body('telefono').optional().isString().trim().isLength({ max: 30 }),
    body('categorias').optional().isArray(),
    body('activo').optional().isBoolean(),
    handleValidationErrors,
  ],
  updateSupplier
);

router.delete(
  '/:id',
  [param('id').isMongoId().withMessage('ID de proveedor inválido'), handleValidationErrors],
  deleteSupplier
);

export default router;
