import express from 'express';
import databaseController from '../controller/DatabaseController.js';
const router = express.Router();
router.get('/aiven-status', databaseController.getAivenStatus);
export default router;
//# sourceMappingURL=DatabaseRoute.js.map