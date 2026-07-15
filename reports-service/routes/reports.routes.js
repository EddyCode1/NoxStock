import { Router } from 'express';
import { authenticateJwt } from '../middlewares/auth.middleware.js';
import {
    getCategoriesReport,
    getNoMovementReport,
    getRotationReport,
    getSummaryReport,
    getTopProductsReport,
} from '../controllers/reports.controller.js';

const router = Router();

router.use(authenticateJwt);

router.get('/top-products', getTopProductsReport);
router.get('/categories', getCategoriesReport);
router.get('/summary', getSummaryReport);
router.get('/rotation', getRotationReport);
router.get('/no-movement', getNoMovementReport);

export default router;