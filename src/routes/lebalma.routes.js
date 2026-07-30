import { Router } from 'express';
import * as lebalmaController from '../controllers/lebalma.controller.js';
import { protect } from '../middleware/auth.middleware.js';

const router = Router();

// Simulateur public
router.get('/simulate', lebalmaController.simulate);

// Souscription & suivi (connecté)
router.use(protect);
router.post('/subscribe', lebalmaController.subscribe);
router.get('/contracts', lebalmaController.myContracts);

export default router;
