import { Router } from 'express';
import RiskMapController from '../controller/RiskMapController.js';
import { authenticateToken, isAdmin } from '../middleware/authMiddleware.js';
const router = Router();
router.use(authenticateToken);
// Resident coordinates (Public to logged in users)
router.get('/residents', RiskMapController.getAllResidentLocations);
// Flood Zone Management
router.get('/flood-zones', RiskMapController.getFloodZones);
router.post('/flood-zones', isAdmin, RiskMapController.createFloodZone);
router.put('/flood-zones/:id', isAdmin, RiskMapController.updateFloodZone);
router.delete('/flood-zones/:id', isAdmin, RiskMapController.deleteFloodZone);
export default router;
//# sourceMappingURL=RiskMapRoute.js.map