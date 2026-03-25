import { Router } from 'express';
import EventController from '../controller/EventsController.js';
import { authenticateToken, isAdmin } from '../middleware/authMiddleware.js';
import { upload } from '../middleware/uploadMiddleware.js';
const router = Router();
router.use(authenticateToken);

router.get('/', EventController.getAllEvents);
router.get('/birthdays', EventController.getAllBirthdays);

router.post('/create', isAdmin, upload.single('event_bg'), EventController.createEvent);

router.put('/:id', isAdmin, upload.single('event_bg'), EventController.updateEvent);
router.delete('/:id', isAdmin, EventController.deleteEvent);

export default router;