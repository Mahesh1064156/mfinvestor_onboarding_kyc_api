import express from 'express';
import { authMiddleware } from '../../common/middleware/auth.middleware';
import { roleMiddleware } from '../../common/middleware/role.middleware';
import { asyncHandler } from '../../common/utils/asyncHandler';
import * as controller from './admin.controller';

const router = express.Router();
router.get('/dashboard', authMiddleware, roleMiddleware('ADMIN'), asyncHandler(controller.dashboard));
router.get('/audit-logs', authMiddleware, roleMiddleware('ADMIN'), asyncHandler(controller.auditLogs));
export default router;
