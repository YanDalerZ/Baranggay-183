import { Router } from 'express';
import UserController from '../controller/UserController.js';
import { authenticateToken, isAdmin } from '../middleware/authMiddleware.js';

const router = Router();
router.use(authenticateToken);
router.get('/priority', isAdmin, UserController.getPriority);

router.get('/', UserController.fetchAllUsers);
router.get('/:system_id', UserController.fetchUserBySystemId);

router.post('/', isAdmin, UserController.AddNewUser);
router.put('/:system_id', isAdmin, UserController.updateUser);
router.delete('/:system_id', isAdmin, UserController.DeleteUserBySystemId);
export default router;