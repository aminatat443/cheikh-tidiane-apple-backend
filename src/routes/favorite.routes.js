import { Router } from 'express';
import * as favoriteController from '../controllers/favorite.controller.js';
import { protect } from '../middleware/auth.middleware.js';

const router = Router();

router.use(protect);
router.get('/', favoriteController.list);
router.post('/', favoriteController.add);
router.delete('/:productId', favoriteController.remove);

export default router;
