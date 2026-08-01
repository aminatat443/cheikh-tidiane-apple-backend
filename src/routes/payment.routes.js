import { Router } from 'express';
import * as paymentController from '../controllers/payment.controller.js';
import { protect } from '../middleware/auth.middleware.js';

const router = Router();

// Webhooks passerelle (PUBLIC — signature vérifiée dans le controller).
router.post('/webhook/:provider', paymentController.handleWebhook);

router.use(protect);
router.post('/', paymentController.initiatePayment);
router.get('/', paymentController.myPayments);
router.get('/:id', paymentController.getPayment);
router.post('/:id/simulate', paymentController.simulatePayment);

export default router;
