import { Router } from 'express';
import UserController from '../controller/UserController.js';

const router = Router();
router.get('/', UserController.fetchAllUsers);
router.get('/:system_id', UserController.fetchUserBySystemId);

router.post('/', UserController.AddNewUser);

router.put('/:system_id', UserController.updateUser);

export default router;