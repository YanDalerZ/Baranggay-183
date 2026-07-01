import { Router } from 'express';
import SuperAdminUserController from '../controller/SuperAdminUserController.js';
import { authenticateToken } from '../middleware/authMiddleware.js';

const router = Router();
router.use(authenticateToken);

router.get('/', SuperAdminUserController.fetchAllUsers);
router.get('/:system_id', SuperAdminUserController.fetchUserBySystemId);
router.post('/', SuperAdminUserController.AddNewUser);
router.put('/:system_id', SuperAdminUserController.updateUser);
router.delete('/:system_id', SuperAdminUserController.DeleteUserBySystemId);

export default router;