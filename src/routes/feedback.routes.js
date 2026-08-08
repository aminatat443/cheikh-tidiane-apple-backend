import { Router } from 'express';
import * as feedbackController from '../controllers/feedback.controller.js';

const router = Router();

router.get('/', feedbackController.listApproved);
router.post('/', feedbackController.create);

export default router;
