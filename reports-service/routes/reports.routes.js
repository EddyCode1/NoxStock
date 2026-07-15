import { Router } from 'express';
import { authenticateJwt } from '../middlewares/auth.middleware.js';
import {
    getCategoriesReport,
    getSummaryReport,
    getTopProductsReport,
} from '../controllers/reports.controller.js';

const router = Router();

router.use(authenticateJwt);

router.get('/top-products', getTopProductsReport);
router.get('/categories', getCategoriesReport);
router.get('/summary', getSummaryReport);

export default router;