import { Router } from 'express';
import * as userController from '../controllers/user.controller.js';
import * as favoriteController from '../controllers/favorite.controller.js';
import { protect } from '../middleware/auth.middleware.js';

const router = Router();

router.use(protect);
router.get('/profile', userController.getProfile);
router.put('/profile', userController.updateProfile);
router.get('/favorites', favoriteController.list);

export default router;
