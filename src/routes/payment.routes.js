import { Router } from 'express';
import * as paymentController from '../controllers/payment.controller.js';
import { protect } from '../middleware/auth.middleware.js';

const router = Router();

// Webhook passerelle (public, mais signature vérifiée dans le controller)
router.post('/webhook', paymentController.handleWebhook);

router.use(protect);
router.post('/', paymentController.initiatePayment);
router.get('/', paymentController.myPayments);

export default router;
