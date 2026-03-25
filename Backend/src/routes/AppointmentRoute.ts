import { Router } from 'express';
import AppointmentController from '../controller/AppointmentController.js';
import { authenticateToken, isAdmin } from '../middleware/authMiddleware.js';
import { upload } from '../middleware/uploadMiddleware.js';

const router = Router();

router.use(authenticateToken);

router.get('/', AppointmentController.getUserAppointments);
router.get('/:id/attachment', AppointmentController.getAttachment);
router.post('/', upload.single('attachment'), AppointmentController.createAppointment);

router.get('/admin/all', AppointmentController.getAllAppointmentsAdmin);
router.patch('/:id/status', isAdmin, AppointmentController.updateStatus);
// Add this to your router file
router.delete('/:id', AppointmentController.deleteAppointment);
export default router;