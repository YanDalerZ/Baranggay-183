import { Router } from 'express';
import EventController from '../controller/EventsController.js';
import { authenticateToken, isAdmin } from '../middleware/authMiddleware.js';
const router = Router();
router.use(authenticateToken);
router.use(isAdmin);
router.get('/', EventController.getAllEvents);
router.get('/birthdays', EventController.getAllBirthdays);
router.post('/create', EventController.createEvent);
export default router;
//# sourceMappingURL=EventsRoute.js.map