import { Router } from 'express';
import UserController from '../controller/UserController.js';
import { authenticateToken, isAdmin } from '../middleware/authMiddleware.js';
import { upload } from '../middleware/uploadMiddleware';
const router = Router();
router.use(authenticateToken);
router.get('/priority', isAdmin, UserController.getPriority);
router.get('/', UserController.fetchAllUsers);
router.get('/:system_id', UserController.fetchUserBySystemId);
router.get('/locations', isAdmin, UserController.getAllResidentLocations);
router.post('/', upload.fields([
    { name: 'photo_2x2', maxCount: 1 },
    { name: 'proof_of_residency', maxCount: 1 }
]), isAdmin, UserController.AddNewUser);
router.put('/:system_id', upload.fields([
    { name: 'photo_2x2', maxCount: 1 },
    { name: 'proof_of_residency', maxCount: 1 }
]), isAdmin, UserController.updateUser);
router.put('/id/:id/coordinates', isAdmin, UserController.updateUserCoordinates);
router.delete('/:system_id', isAdmin, UserController.DeleteUserBySystemId);
export default router;
//# sourceMappingURL=UserRoute.js.map