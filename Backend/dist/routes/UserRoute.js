import { Router } from 'express';
import UserController from '../controller/UserController.js';
import { authenticateToken, isAdmin } from '../middleware/authMiddleware.js';
const router = Router();
router.use(authenticateToken);
router.use(isAdmin);
router.get('/', UserController.fetchAllUsers);
router.get('/:system_id', UserController.fetchUserBySystemId);
router.post('/', UserController.AddNewUser);
router.put('/:system_id', UserController.updateUser);
router.delete('/:system_id', UserController.DeleteUserBySystemId);
export default router;
//# sourceMappingURL=UserRoute.js.map