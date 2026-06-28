import { Response } from 'express';
import { AuthRequest } from '../../common/middleware/auth.middleware';
import { successResponse } from '../../common/utils/apiResponse';
import { panSchema } from '../../common/validations/pan.validation';
import { documentUploadSchema } from '../../common/validations/kyc.validation';
import * as service from './kyc.service';

export const submitPan = async (req: AuthRequest, res: Response) => {
  await service.submitPan(req.user!.id, panSchema.parse(req.body));
  return successResponse(res, 'PAN details submitted successfully');
};
export const uploadDocument = async (req: AuthRequest, res: Response) => {
  const payload = documentUploadSchema.parse(req.body);
  const document = await service.uploadDocument(req.user!.id, payload.documentType, req.file);
  return successResponse(res, 'Document uploaded successfully', { fileUrl: document.fileUrl, documentId: document._id }, 201);
};
export const getStatus = async (req: AuthRequest, res: Response) => successResponse(res, 'Status retrieved successfully', await service.getStatus(req.user!.id));
