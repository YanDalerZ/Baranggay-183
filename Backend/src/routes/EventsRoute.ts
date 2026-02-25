import { Router } from 'express';
import EventController from '../controller/EventsController.js';

const router = Router();

router.get('/', EventController.getAllEvents);
router.get('/birthdays', EventController.getAllBirthdays);

router.post('/create', EventController.createEvent);

export default router;