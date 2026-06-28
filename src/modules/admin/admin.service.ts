import { InvestorProfile } from '../investor/investor.model';
import { AuditLog } from './audit.model';

export const createAuditLog = async (payload: any) => AuditLog.create(payload);

export const getDashboardSummary = async () => {
  const [totalApplications, pending, underReview, approved, rejected, reuploadRequired, todaysRegistrations] = await Promise.all([
    InvestorProfile.countDocuments(),
    InvestorProfile.countDocuments({ onboardingStatus: 'DOCUMENT_UPLOADED' }),
    InvestorProfile.countDocuments({ onboardingStatus: 'UNDER_REVIEW' }),
    InvestorProfile.countDocuments({ onboardingStatus: 'APPROVED' }),
    InvestorProfile.countDocuments({ onboardingStatus: 'REJECTED' }),
    InvestorProfile.countDocuments({ onboardingStatus: 'REUPLOAD_REQUIRED' }),
    InvestorProfile.countDocuments({ createdAt: { $gte: new Date(new Date().setHours(0,0,0,0)) } }),
  ]);
  return { totalApplications, pending, underReview, approved, rejected, reuploadRequired, todaysRegistrations };
};

export const getAuditLogs = async () => AuditLog.find().populate('actorId', 'name email role').sort({ createdAt: -1 }).limit(200);
