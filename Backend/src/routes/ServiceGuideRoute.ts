import { Router } from 'express';
import ServiceGuideController from '../controller/ServiceGuideController.js';
import { authenticateToken, isAdmin } from '../middleware/authMiddleware.js';


const router = Router();
router.use(authenticateToken);

router.get('/', ServiceGuideController.getAllGuides);

router.post('/', isAdmin, ServiceGuideController.createGuide);
router.put('/:id', isAdmin, ServiceGuideController.updateGuide);
router.delete('/:id', isAdmin, ServiceGuideController.deleteGuide);

export default router;