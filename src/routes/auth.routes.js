import { Router } from 'express';
import * as authController from '../controllers/auth.controller.js';
import { registerRules, loginRules } from '../validators/auth.validator.js';
import { validate } from '../validators/validate.js';
import { protect } from '../middleware/auth.middleware.js';

const router = Router();

router.post('/register', registerRules, validate, authController.register);
router.post('/login', loginRules, validate, authController.login);
router.get('/me', protect, authController.me);

export default router;
