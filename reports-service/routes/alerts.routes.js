import { Router } from 'express';
import { authenticateJwt } from '../middlewares/auth.middleware.js';
import { getLowStockAlerts, getOutOfStockAlerts } from '../controllers/alerts.controller.js';

const router = Router();

router.use(authenticateJwt);

router.get('/low-stock', getLowStockAlerts);
router.get('/out-of-stock', getOutOfStockAlerts);

export default router;