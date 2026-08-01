import { Router } from 'express';
import * as authController from '../controllers/auth.controller.js';
import { registerRules, loginRules } from '../validators/auth.validator.js';
import { validate } from '../validators/validate.js';
import { protect } from '../middleware/auth.middleware.js';

const router = Router();

router.post('/register', registerRules, validate, authController.register);
router.post('/login', loginRules, validate, authController.login);
router.post('/google', authController.googleAuth);
router.get('/me', protect, authController.me);

// Double authentification (2FA / TOTP)
router.post('/2fa/verify', authController.verifyTwoFactor); // étape de connexion (jeton temporaire)
router.post('/2fa/enroll', authController.enrollTwoFactor); // 1re connexion admin : QR
router.post('/2fa/enroll/verify', authController.enrollVerifyTwoFactor); // active + connecte
router.post('/2fa/setup', protect, authController.setupTwoFactor);
router.post('/2fa/enable', protect, authController.enableTwoFactor);
router.post('/2fa/disable', protect, authController.disableTwoFactor);

export default router;
