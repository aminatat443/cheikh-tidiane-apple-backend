import { Router } from 'express';
import * as cartController from '../controllers/cart.controller.js';
import { protect } from '../middleware/auth.middleware.js';

const router = Router();

router.use(protect); // panier réservé aux utilisateurs connectés

router.get('/', cartController.getCart);
router.post('/', cartController.addToCart);
router.put('/:itemId', cartController.updateItem);
router.delete('/:itemId', cartController.removeItem);

export default router;
