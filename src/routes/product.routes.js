import { Router } from 'express';
import * as productController from '../controllers/product.controller.js';
import * as reviewController from '../controllers/review.controller.js';
import { protect } from '../middleware/auth.middleware.js';

const router = Router();

// Catalogue public (recherche + filtres temps réel via query params)
router.get('/', productController.list);
router.get('/:id', productController.getOne);

// Avis produit
router.get('/:productId/reviews', reviewController.listByProduct);
router.post('/:productId/reviews', protect, reviewController.create);

export default router;
