import express from 'express';
import { authMiddleware } from '../../common/middleware/auth.middleware';
import { roleMiddleware } from '../../common/middleware/role.middleware';
import { asyncHandler } from '../../common/utils/asyncHandler';
import * as controller from './notification.controller';

const router = express.Router();
router.get('/', authMiddleware, roleMiddleware('INVESTOR'), asyncHandler(controller.list));
router.patch('/:id/read', authMiddleware, roleMiddleware('INVESTOR'), asyncHandler(controller.markRead));
export default router;
