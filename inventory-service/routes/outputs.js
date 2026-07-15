import { Router } from 'express';
import { body, query } from 'express-validator';
import { getOutputs, registerOutput } from '../controllers/outputController.js';
import { validateJWT } from '../middlewares/auth.js';
import { handleValidationErrors } from '../middlewares/validators.js';

const router = Router();

router.use(validateJWT);

router.get(
  '/',
  [query('productId').optional().isMongoId().withMessage('ID de producto inválido'), handleValidationErrors],
  getOutputs
);

router.post(
  '/',
  [
    body('productId').isMongoId().withMessage('ID de producto inválido'),
    body('cantidad').isInt({ min: 1 }).withMessage('La cantidad debe ser mayor a 0'),
    body('motivo').optional().isString().trim().isLength({ max: 200 }),
    handleValidationErrors,
  ],
  registerOutput
);

export default router;
