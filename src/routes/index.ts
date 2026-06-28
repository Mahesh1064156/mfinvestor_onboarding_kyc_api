import express from 'express';
import authRoutes from '../modules/auth/auth.routes';
import investorRoutes from '../modules/investor/investor.routes';
import kycRoutes from '../modules/kyc/kyc.routes';
import verificationRoutes from '../modules/verification/verification.routes';
import adminRoutes from '../modules/admin/admin.routes';
import notificationRoutes from '../modules/notification/notification.routes';
import compatibilityRoutes from './compatibility';

const router = express.Router();
router.use('/auth', authRoutes);
router.use('/investor', investorRoutes);
router.use('/kyc', kycRoutes);
router.use('/verification', verificationRoutes);
router.use('/admin', adminRoutes);
router.use('/notifications', notificationRoutes);

// Mobile Compatibility Fallbacks
router.use('/', compatibilityRoutes);

export default router;
