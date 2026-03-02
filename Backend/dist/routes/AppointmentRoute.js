import { Router } from 'express';
import AppointmentController from '../controller/AppointmentController.js';
import { authenticateToken, isAdmin } from '../middleware/authMiddleware.js';
const router = Router();
router.use(authenticateToken);
router.get('/', AppointmentController.getUserAppointments);
router.post('/', AppointmentController.createAppointment);
router.patch('/:id/status', isAdmin, AppointmentController.updateStatus);
router.get('/admin/all', isAdmin, AppointmentController.getAllAppointmentsAdmin);
export default router;
//# sourceMappingURL=AppointmentRoute.js.map