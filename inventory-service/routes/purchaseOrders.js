import { Router } from 'express';
import { body, param, query } from 'express-validator';
import {
  cancelPurchaseOrder,
  createPurchaseOrder,
  getPurchaseOrderById,
  getPurchaseOrders,
  receivePurchaseOrder,
  sendPurchaseOrder,
  updatePurchaseOrder,
} from '../controllers/purchaseOrderController.js';
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
    query('estado').optional().isIn(['borrador', 'enviada', 'recibida', 'cancelada']),
    query('supplierId').optional().isMongoId(),
    query('warehouseId').optional().isMongoId(),
    handleValidationErrors,
  ],
  getPurchaseOrders
);

router.get(
  '/:id',
  [param('id').isMongoId().withMessage('ID de orden inválido'), handleValidationErrors],
  getPurchaseOrderById
);

router.post(
  '/',
  [
    body('supplierId').isMongoId().withMessage('ID de proveedor inválido'),
    body('warehouseId').isMongoId().withMessage('warehouseId es obligatorio'),
    body('notas').optional().isString().trim().isLength({ max: 300 }),
    ...itemValidators,
    handleValidationErrors,
  ],
  createPurchaseOrder
);

router.put(
  '/:id',
  [
    param('id').isMongoId().withMessage('ID de orden inválido'),
    body('supplierId').optional().isMongoId(),
    body('notas').optional().isString().trim().isLength({ max: 300 }),
    body('items').optional().isArray({ min: 1 }),
    body('items.*.productId').optional().isMongoId(),
    body('items.*.cantidad').optional().isInt({ min: 1 }),
    body('items.*.precioUnitario').optional().isFloat({ min: 0 }),
    handleValidationErrors,
  ],
  updatePurchaseOrder
);

router.post(
  '/:id/send',
  [param('id').isMongoId().withMessage('ID de orden inválido'), handleValidationErrors],
  sendPurchaseOrder
);

router.post(
  '/:id/receive',
  [param('id').isMongoId().withMessage('ID de orden inválido'), handleValidationErrors],
  receivePurchaseOrder
);

router.post(
  '/:id/cancel',
  [param('id').isMongoId().withMessage('ID de orden inválido'), handleValidationErrors],
  cancelPurchaseOrder
);

export default router;
