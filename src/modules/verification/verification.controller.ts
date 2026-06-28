import { Request, Response } from 'express';
import { AuthRequest } from '../../common/middleware/auth.middleware';
import { successResponse } from '../../common/utils/apiResponse';
import { verificationStatusSchema } from '../../common/validations/verification.validation';
import * as service from './verification.service';

export const getApplications = async (req: Request, res: Response) => successResponse(res, 'Applications retrieved successfully', await service.getApplications(req.query.status as string | undefined));
export const getApplicationDetails = async (req: AuthRequest, res: Response) => successResponse(res, 'Application details retrieved successfully', await service.getApplicationDetails(req.params.investorId, req.user?.id, req.user?.role));
export const updateStatus = async (req: AuthRequest, res: Response) => {
  await service.updateStatus(req.params.investorId, req.user!.id, req.user!.role, verificationStatusSchema.parse(req.body));
  return successResponse(res, 'Verification status updated successfully');
};
