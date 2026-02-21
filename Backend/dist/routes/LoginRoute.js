import { Router } from 'express';
import LoginController from '../controller/LoginController.js';
const router = Router();
router.post('/', LoginController.login);
export default router;
//# sourceMappingURL=LoginRoute.js.map