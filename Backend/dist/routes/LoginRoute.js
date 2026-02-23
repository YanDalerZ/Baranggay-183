import { Router } from 'express';
import LoginController from '../controller/LoginController.js';
const router = Router();
router.post('/', LoginController.UserLogin);
router.post('/admin', LoginController.AdminLogin);
export default router;
//# sourceMappingURL=LoginRoute.js.map