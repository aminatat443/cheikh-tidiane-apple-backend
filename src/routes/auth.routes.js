import { Router } from 'express';
import * as authController from '../controllers/auth.controller.js';
import { registerRules, loginRules } from '../validators/auth.validator.js';
import { validate } from '../validators/validate.js';
import { protect } from '../middleware/auth.middleware.js';

const router = Router();

router.post('/register', registerRules, validate, authController.register);
router.post('/login', loginRules, validate, authController.login);
// Connexion via Google Identity Services. Chemin volontairement « /social »
// (et non « /google ») pour éviter le blocage par les bloqueurs de pub.
router.post('/social', authController.googleAuth);
router.post('/google', authController.googleAuth); // alias de compatibilité
router.get('/me', protect, authController.me);

// Double authentification (2FA / TOTP)
router.post('/2fa/verify', authController.verifyTwoFactor); // étape de connexion (jeton temporaire)
router.post('/2fa/enroll', authController.enrollTwoFactor); // 1re connexion admin : QR
router.post('/2fa/enroll/verify', authController.enrollVerifyTwoFactor); // active + connecte
router.post('/2fa/setup', protect, authController.setupTwoFactor);
router.post('/2fa/enable', protect, authController.enableTwoFactor);
router.post('/2fa/disable', protect, authController.disableTwoFactor);

export default router;
