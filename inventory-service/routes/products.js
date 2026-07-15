import { Router } from 'express';
import { body, param, query } from 'express-validator';
import {
  createProduct,
  deleteProduct,
  getProductById,
  getProducts,
  updateProduct,
} from '../controllers/productController.js';
import { validateJWT } from '../middlewares/auth.js';
import { handleValidationErrors } from '../middlewares/validators.js';

const router = Router();

router.use(validateJWT);

router.get(
  '/',
  [
    query('q').optional().isString().trim().isLength({ max: 120 }),
    query('categoria').optional().isString().trim().isLength({ max: 80 }),
    handleValidationErrors,
  ],
  getProducts
);

router.get(
  '/:id',
  [param('id').isMongoId().withMessage('ID de producto inválido'), handleValidationErrors],
  getProductById
);

router.post(
  '/',
  [
    body('nombre').trim().notEmpty().withMessage('El nombre es obligatorio').isLength({ max: 120 }),
    body('categoria').trim().notEmpty().withMessage('La categoría es obligatoria').isLength({ max: 80 }),
    body('precio').isFloat({ min: 0 }).withMessage('El precio debe ser mayor o igual a 0'),
    body('existencia').optional().isInt({ min: 0 }).withMessage('La existencia debe ser mayor o igual a 0'),
    handleValidationErrors,
  ],
  createProduct
);

router.put(
  '/:id',
  [
    param('id').isMongoId().withMessage('ID de producto inválido'),
    body('nombre').optional().trim().notEmpty().isLength({ max: 120 }),
    body('categoria').optional().trim().notEmpty().isLength({ max: 80 }),
    body('precio').optional().isFloat({ min: 0 }),
    handleValidationErrors,
  ],
  updateProduct
);

router.delete(
  '/:id',
  [param('id').isMongoId().withMessage('ID de producto inválido'), handleValidationErrors],
  deleteProduct
);

export default router;
