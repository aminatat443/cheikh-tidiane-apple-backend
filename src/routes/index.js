import { Router } from 'express';
import authRoutes from './auth.routes.js';
import userRoutes from './user.routes.js';
import productRoutes from './product.routes.js';
import categoryRoutes from './category.routes.js';
import cartRoutes from './cart.routes.js';
import orderRoutes from './order.routes.js';
import paymentRoutes from './payment.routes.js';
import favoriteRoutes from './favorite.routes.js';
import lebalmaRoutes from './lebalma.routes.js';
import returnRoutes from './return.routes.js';
import notificationRoutes from './notification.routes.js';
import feedbackRoutes from './feedback.routes.js';
import adminRoutes from './admin.routes.js';
import { DELIVERY_ZONES } from '../config/delivery.js';

const router = Router();

// Zones de livraison (public) — pour le sélecteur au paiement
router.get('/delivery/zones', (req, res) => res.json({ success: true, data: DELIVERY_ZONES }));

router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/products', productRoutes);
router.use('/categories', categoryRoutes);
router.use('/cart', cartRoutes);
router.use('/orders', orderRoutes);
router.use('/payments', paymentRoutes);
router.use('/favorites', favoriteRoutes);
router.use('/lebalma', lebalmaRoutes);
router.use('/returns', returnRoutes);
router.use('/notifications', notificationRoutes);
router.use('/feedback', feedbackRoutes);
router.use('/admin', adminRoutes);

export default router;
