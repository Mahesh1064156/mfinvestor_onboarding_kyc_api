
import express from 'express';
import authrouter from '../modules/auth/auth.routes'
import kycRouter from '../modules/kyc/kyc.routes'

const router=express.Router();
router.use('/admin',authrouter);
router.use('/kyc', kycRouter);
export default router;
