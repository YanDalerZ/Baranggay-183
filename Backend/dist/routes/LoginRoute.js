import { Router } from 'express';
import LoginController from '../controller/LoginController.js';
const router = Router();
router.post('/', LoginController.UserLogin);
router.post('/admin', LoginController.AdminLogin);
router.post('/superadmin', LoginController.SuperAdminLogin);
router.get('/verify', LoginController.VerifyToken);
router.post('/forgot-password', LoginController.ForgotPassword);
router.post('/reset-password', LoginController.ResetPassword);
export default router;
//# sourceMappingURL=LoginRoute.js.map