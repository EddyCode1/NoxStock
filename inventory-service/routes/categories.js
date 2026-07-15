import { Router } from 'express';
import { getCategories } from '../controllers/categoryController.js';
import { validateJWT } from '../middlewares/auth.js';

const router = Router();

router.use(validateJWT);
router.get('/', getCategories);

export default router;
