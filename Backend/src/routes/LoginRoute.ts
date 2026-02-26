import { Router } from 'express';
import LoginController from '../controller/LoginController.js';

const router = Router();
router.post('/', LoginController.UserLogin);
router.post('/admin', LoginController.AdminLogin);
router.get('/verify', LoginController.VerifyToken);
export default router;