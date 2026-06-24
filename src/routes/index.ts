import express from 'express';
import authrouter from '../modules/auth/auth.routes'

const router=express.Router();
router.use('/admin',authrouter);
export default router;