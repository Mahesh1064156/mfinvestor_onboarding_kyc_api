import { Types } from 'mongoose';
import { ApiError } from '../../common/utils/apiError';
import { InvestorProfile } from '../investor/investor.model';
import { KycDocument } from './kyc.model';
import { VerificationRequest } from '../verification/verification.model';
import { uploadToSupabase } from '../../integrations/storage.service';
import { createAuditLog } from '../admin/admin.service';

export const submitPan = async (userId: string, payload: any) => {
  const profile = await InvestorProfile.findOneAndUpdate({ userId }, {
    panNumber: payload.panNumber,
    panName: payload.panName,
    dateOfBirth: new Date(payload.dateOfBirth),
    panValidated: true,
    onboardingStatus: 'PAN_SUBMITTED',
  }, { new: true });
  if (!profile) throw new ApiError(404, 'Investor profile not found', 'NOT_FOUND');
  await createAuditLog({ actorId: new Types.ObjectId(userId), actorRole: 'INVESTOR', action: 'PAN_SUBMITTED', entityType: 'INVESTOR_PROFILE', entityId: profile._id });
  return profile;
};

export const uploadDocument = async (userId: string, documentType: string, file?: Express.Multer.File) => {
  if (!file) throw new ApiError(400, 'File is required', 'VALIDATION_ERROR');
  const profile = await InvestorProfile.findOne({ userId });
  if (!profile) throw new ApiError(404, 'Investor profile not found', 'NOT_FOUND');
  if (!profile.panValidated) throw new ApiError(400, 'Submit PAN before uploading documents', 'PAN_REQUIRED');

  const safeName = file.originalname.replace(/[^a-zA-Z0-9._-]/g, '_');
  const path = `${userId}/${documentType}-${Date.now()}-${safeName}`;
  const storage = await uploadToSupabase(file, path);
  const document = await KycDocument.create({ userId, documentType, fileName: file.originalname, fileUrl: storage.fileUrl, storagePath: storage.storagePath, mimeType: file.mimetype, fileSize: file.size });

  await InvestorProfile.findOneAndUpdate({ userId }, { onboardingStatus: 'DOCUMENT_UPLOADED' });
  await VerificationRequest.findOneAndUpdate({ investorId: userId }, { investorId: userId, status: 'PENDING' }, { upsert: true, new: true });
  await createAuditLog({ actorId: new Types.ObjectId(userId), actorRole: 'INVESTOR', action: 'DOCUMENT_UPLOADED', entityType: 'DOCUMENT', entityId: document._id });
  return document;
};

export const getStatus = async (userId: string) => {
  const profile = await InvestorProfile.findOne({ userId });
  if (!profile) throw new ApiError(404, 'Investor profile not found', 'NOT_FOUND');
  const verification = await VerificationRequest.findOne({ investorId: userId }).sort({ createdAt: -1 });
  return { status: profile.onboardingStatus, remarks: verification?.remarks || '' };
};
