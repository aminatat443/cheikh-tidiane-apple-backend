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
// Le client initie le paiement d'une de ses échéances (Wave / OM / virement / espèces)
router.post('/installments/:id/pay', lebalmaController.clientInitiatePayment);

export default router;
