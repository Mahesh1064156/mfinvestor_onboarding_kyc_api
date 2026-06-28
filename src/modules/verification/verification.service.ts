import { Types } from 'mongoose';
import { ApiError } from '../../common/utils/apiError';
import { User } from '../auth/auth.model';
import { InvestorProfile } from '../investor/investor.model';
import { KycDocument } from '../kyc/kyc.model';
import { VerificationRequest } from './verification.model';
import { createNotification } from '../notification/notification.service';
import { createAuditLog } from '../admin/admin.service';

export const getApplications = async (status?: string) => {
  const query: any = status ? { status } : {};
  const requests = await VerificationRequest.find(query).populate('investorId', 'name email phone').sort({ createdAt: -1 });
  return Promise.all(requests.map(async (request: any) => {
    const profile = await InvestorProfile.findOne({ userId: request.investorId._id });
    return { investorId: request.investorId._id, name: request.investorId.name, email: request.investorId.email, panNumber: profile?.panNumber, status: request.status };
  }));
};

export const getApplicationDetails = async (investorId: string, actorId?: string, actorRole?: string) => {
  const investor = await User.findById(investorId).select('name email phone role');
  if (!investor) throw new ApiError(404, 'Investor not found', 'NOT_FOUND');
  const profile = await InvestorProfile.findOne({ userId: investorId });
  const documents = await KycDocument.find({ userId: investorId });
  if (actorId) await createAuditLog({ actorId: new Types.ObjectId(actorId), actorRole, action: 'APPLICATION_REVIEWED', entityType: 'KYC_APPLICATION', entityId: new Types.ObjectId(investorId) });
  return { investor, profile, pan: { panNumber: profile?.panNumber, panName: profile?.panName, panValidated: profile?.panValidated }, documents };
};

export const updateStatus = async (investorId: string, officerId: string, role: string, payload: any) => {
  const oldProfile = await InvestorProfile.findOne({ userId: investorId });
  if (!oldProfile) throw new ApiError(404, 'Investor profile not found', 'NOT_FOUND');

  const request = await VerificationRequest.findOneAndUpdate({ investorId }, { status: payload.status, remarks: payload.remarks, officerId, reviewedAt: new Date() }, { new: true, upsert: true });
  await InvestorProfile.findOneAndUpdate({ userId: investorId }, { onboardingStatus: payload.status });

  const docStatus = payload.status === 'APPROVED' ? 'VERIFIED' : payload.status === 'REJECTED' || payload.status === 'REUPLOAD_REQUIRED' ? 'REJECTED' : 'PENDING';
  await KycDocument.updateMany({ userId: investorId }, { verificationStatus: docStatus });

  const notificationTitle = payload.status === 'APPROVED' ? 'KYC Approved' : payload.status === 'REJECTED' ? 'KYC Rejected' : payload.status === 'REUPLOAD_REQUIRED' ? 'Document Reupload Required' : 'KYC Under Review';
  await createNotification({ userId: investorId, title: notificationTitle, message: payload.remarks || `Your KYC status is ${payload.status}.`, type: 'KYC_STATUS' });

  const action = payload.status === 'APPROVED' ? 'KYC_APPROVED' : payload.status === 'REJECTED' ? 'KYC_REJECTED' : payload.status === 'REUPLOAD_REQUIRED' ? 'DOCUMENT_REJECTED' : 'STATUS_UPDATED';
  await createAuditLog({ actorId: new Types.ObjectId(officerId), actorRole: role, action, entityType: 'KYC_APPLICATION', entityId: new Types.ObjectId(investorId), oldValue: { status: oldProfile.onboardingStatus }, newValue: { status: payload.status, remarks: payload.remarks } });
  return request;
};
