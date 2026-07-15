import { Router } from 'express';
import { getStatistics } from '../controllers/statisticsController.js';
import { validateJWT } from '../middlewares/auth.js';

const router = Router();

router.use(validateJWT);

router.get('/', getStatistics);

export default router;
