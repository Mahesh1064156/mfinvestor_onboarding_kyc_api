import express from 'express';
import { authMiddleware } from '../../common/middleware/auth.middleware';
import { roleMiddleware } from '../../common/middleware/role.middleware';
import { upload } from '../../common/middleware/upload.middleware';
import { asyncHandler } from '../../common/utils/asyncHandler';
import * as controller from './kyc.controller';

const router = express.Router();
router.post('/pan', authMiddleware, roleMiddleware('INVESTOR'), asyncHandler(controller.submitPan));
router.post('/documents', authMiddleware, roleMiddleware('INVESTOR'), upload.single('file'), asyncHandler(controller.uploadDocument));
router.get('/status', authMiddleware, roleMiddleware('INVESTOR'), asyncHandler(controller.getStatus));
export default router;
