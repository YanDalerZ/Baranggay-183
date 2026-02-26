import { Router } from 'express';
import NotificationController from '../controller/NotificationController.js';
import { authenticateToken, isAdmin } from '../middleware/authMiddleware.js';
const router = Router();
router.use(authenticateToken);
router.get('/user/:id', NotificationController.getNotificationsByUser);
router.get('/history', isAdmin, NotificationController.getHistory);
router.get('/stats', isAdmin, NotificationController.getStats);
router.post('/broadcast', isAdmin, NotificationController.sendNotification);
router.post('/send', isAdmin, NotificationController.sendNotification);
router.delete('/:id', isAdmin, NotificationController.deleteNotification);
router.post('/mark-read', NotificationController.markAsRead);
export default router;
//# sourceMappingURL=NotificationRoute.js.map