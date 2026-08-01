import { Router } from 'express';
import * as notificationController from '../controllers/notification.controller.js';
import { protect } from '../middleware/auth.middleware.js';

const router = Router();

router.use(protect);

router.get('/', notificationController.myNotifications);
router.put('/read-all', notificationController.markAllRead);
router.put('/:id/read', notificationController.markRead);
router.delete('/:id', notificationController.remove);

export default router;
