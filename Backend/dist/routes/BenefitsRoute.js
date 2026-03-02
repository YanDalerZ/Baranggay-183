import { Router } from 'express';
import LedgerController from '../controller/BenefitsController.js';
import { authenticateToken, isAdmin } from '../middleware/authMiddleware.js';
const router = Router();
router.use(authenticateToken);
router.get('/getBenefit/:userId', LedgerController.fetchUserBenefitsById);
router.get('/stats/:userId', LedgerController.fetchUserClaimStats);
router.get('/inventory', isAdmin, LedgerController.fetchInventory);
router.post('/inventory', isAdmin, LedgerController.addNewItem);
router.put('/inventory/:id', isAdmin, LedgerController.editItem);
router.delete('/inventory/:id', isAdmin, LedgerController.deleteItem);
router.get('/batches', LedgerController.fetchBatches);
router.get('/distribution/all', LedgerController.fetchAllDistributions);
router.get('/distribution/:batchId', LedgerController.fetchDistributionByBatch);
router.post('/distribution/batch-generate', LedgerController.generateBatch);
router.patch('/claim', LedgerController.claimBenefit);
export default router;
//# sourceMappingURL=BenefitsRoute.js.map