import { Router } from 'express';
import * as returnController from '../controllers/return.controller.js';
import { protect } from '../middleware/auth.middleware.js';

const router = Router();

router.use(protect);

router.post('/', returnController.createReturn);
router.get('/', returnController.myReturns);
router.get('/:id', returnController.getReturn);

export default router;
