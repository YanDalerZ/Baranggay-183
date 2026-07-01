import { Router } from 'express';
import { getConfiguration, updateConfiguration } from '../controller/GlobalConfigurationController.js';
const router = Router();
router.get('/', getConfiguration);
router.put('/', updateConfiguration);
export default router;
//# sourceMappingURL=GlobalConfigurationRoute.js.map