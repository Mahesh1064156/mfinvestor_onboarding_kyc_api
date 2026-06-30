import express from 'express';
import { asyncHandler } from '../../common/utils/asyncHandler';
import * as controller from './auth.controller';

const router = express.Router();
router.post('/register', asyncHandler(controller.register));
router.post('/login', asyncHandler(controller.login));
router.post('/forgot-password', asyncHandler(controller.forgotPassword));
router.post('/reset-password', asyncHandler(controller.resetPassword));
export default router;
