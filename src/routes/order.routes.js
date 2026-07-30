import { Router } from 'express';
import * as orderController from '../controllers/order.controller.js';
import { protect } from '../middleware/auth.middleware.js';

const router = Router();

router.use(protect);

router.post('/', orderController.createOrder);
router.get('/', orderController.myOrders);
router.get('/:id', orderController.getOrder);

export default router;
