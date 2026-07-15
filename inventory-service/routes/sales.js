import { Router } from 'express';
import { body, param, query } from 'express-validator';
import {
  cancelSale,
  confirmSale,
  createSale,
  getSaleById,
  getSales,
  updateSale,
} from '../controllers/saleController.js';
import { validateJWT } from '../middlewares/auth.js';
import { handleValidationErrors } from '../middlewares/validators.js';

const router = Router();

router.use(validateJWT);

const itemValidators = [
  body('items').isArray({ min: 1 }).withMessage('Debe incluir al menos un producto'),
  body('items.*.productId').isMongoId().withMessage('ID de producto inválido'),
  body('items.*.cantidad').isInt({ min: 1 }).withMessage('La cantidad debe ser mayor a 0'),
  body('items.*.precioUnitario').isFloat({ min: 0 }).withMessage('El precio unitario debe ser >= 0'),
];

router.get(
  '/',
  [
    query('estado').optional().isIn(['borrador', 'confirmada', 'cancelada']),
    query('customerId').optional().isMongoId(),
    query('warehouseId').optional().isMongoId(),
    handleValidationErrors,
  ],
  getSales
);

router.get(
  '/:id',
  [param('id').isMongoId().withMessage('ID de venta inválido'), handleValidationErrors],
  getSaleById
);

router.post(
  '/',
  [
    body('customerId').isMongoId().withMessage('ID de cliente inválido'),
    body('notas').optional().isString().trim().isLength({ max: 300 }),
    body('warehouseId').isMongoId().withMessage('warehouseId es obligatorio'),
    ...itemValidators,
    handleValidationErrors,
  ],
  createSale
);

router.put(
  '/:id',
  [
    param('id').isMongoId().withMessage('ID de venta inválido'),
    body('customerId').optional().isMongoId(),
    body('notas').optional().isString().trim().isLength({ max: 300 }),
    body('items').optional().isArray({ min: 1 }),
    body('items.*.productId').optional().isMongoId(),
    body('items.*.cantidad').optional().isInt({ min: 1 }),
    body('items.*.precioUnitario').optional().isFloat({ min: 0 }),
    handleValidationErrors,
  ],
  updateSale
);

router.post(
  '/:id/confirm',
  [param('id').isMongoId().withMessage('ID de venta inválido'), handleValidationErrors],
  confirmSale
);

router.post(
  '/:id/cancel',
  [param('id').isMongoId().withMessage('ID de venta inválido'), handleValidationErrors],
  cancelSale
);

export default router;
