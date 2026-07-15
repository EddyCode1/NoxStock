import { Router } from 'express';
import { body, param, query } from 'express-validator';
import {
  createWarehouse,
  deleteWarehouse,
  getWarehouseById,
  getWarehouses,
  updateWarehouse,
} from '../controllers/warehouseController.js';
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
  getWarehouses
);

router.get(
  '/:id',
  [param('id').isMongoId().withMessage('ID de bodega inválido'), handleValidationErrors],
  getWarehouseById
);

router.post(
  '/',
  [
    body('nombre').trim().notEmpty().withMessage('El nombre es obligatorio').isLength({ max: 120 }),
    body('direccion').optional().isString().trim().isLength({ max: 200 }),
    body('lat').isFloat({ min: -90, max: 90 }).withMessage('Latitud inválida'),
    body('lng').isFloat({ min: -180, max: 180 }).withMessage('Longitud inválida'),
    body('activo').optional().isBoolean(),
    handleValidationErrors,
  ],
  createWarehouse
);

router.put(
  '/:id',
  [
    param('id').isMongoId().withMessage('ID de bodega inválido'),
    body('nombre').optional().trim().notEmpty().isLength({ max: 120 }),
    body('direccion').optional().isString().trim().isLength({ max: 200 }),
    body('lat').optional().isFloat({ min: -90, max: 90 }),
    body('lng').optional().isFloat({ min: -180, max: 180 }),
    body('activo').optional().isBoolean(),
    handleValidationErrors,
  ],
  updateWarehouse
);

router.delete(
  '/:id',
  [param('id').isMongoId().withMessage('ID de bodega inválido'), handleValidationErrors],
  deleteWarehouse
);

export default router;
