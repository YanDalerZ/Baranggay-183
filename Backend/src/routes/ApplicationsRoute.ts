import { Router } from 'express';
import ServiceController from '../controller/ApplicationsController.js';
import { authenticateToken } from '../middleware/authMiddleware.js';
import { upload } from '../middleware/uploadMiddleware.js';

const router = Router();

router.use(authenticateToken);
// Add this line with the other routes
router.get('/user/:system_id', ServiceController.getUserApplications);
router.post('/apply', upload.fields([
    { name: 'medical_cert', maxCount: 1 },
    { name: 'id_proof', maxCount: 1 },
    { name: 'psa_birth', maxCount: 1 }
]), ServiceController.submitApplication);
router.get('/admin/list', ServiceController.getAllApplications);
router.put('/admin/update/:id', ServiceController.updateApplicationStatus);
router.get('/:id', ServiceController.getSingleApplicationDetails);

export default router;