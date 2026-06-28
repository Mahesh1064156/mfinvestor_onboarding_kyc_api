import { Response } from 'express';
import { AuthRequest } from '../../common/middleware/auth.middleware';
import { successResponse } from '../../common/utils/apiResponse';
import * as service from './investor.service';

export const profile = async (req: AuthRequest, res: Response) => successResponse(res, 'Investor profile retrieved successfully', await service.getProfile(req.user!.id));
