import express from 'express';
import { authMiddleware } from '../../common/middleware/auth.middleware';
import { roleMiddleware } from '../../common/middleware/role.middleware';
import { asyncHandler } from '../../common/utils/asyncHandler';
import * as controller from './verification.controller';

const router = express.Router();
router.get('/applications', authMiddleware, roleMiddleware('OFFICER', 'ADMIN'), asyncHandler(controller.getApplications));
router.get('/applications/:investorId', authMiddleware, roleMiddleware('OFFICER', 'ADMIN'), asyncHandler(controller.getApplicationDetails));
router.patch('/applications/:investorId/status', authMiddleware, roleMiddleware('OFFICER'), asyncHandler(controller.updateStatus));
export default router;
