import { Router } from 'express';
import LedgerController from '../controller/BenefitsController.js';

const router = Router();

router.get('/inventory', LedgerController.fetchInventory);
router.post('/inventory', LedgerController.addNewItem);
router.put('/inventory/:id', LedgerController.editItem);
router.delete('/inventory/:id', LedgerController.deleteItem);

router.get('/batches', LedgerController.fetchBatches);
router.get('/distribution/all', LedgerController.fetchAllDistributions);
router.get('/distribution/:batchId', LedgerController.fetchDistributionByBatch);
router.post('/distribution/batch-generate', LedgerController.generateBatch);

router.patch('/claim', LedgerController.claimBenefit);

export default router;