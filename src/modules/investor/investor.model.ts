import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IInvestorProfile extends Document {
  userId: Types.ObjectId;
  fullName: string;
  dateOfBirth?: Date;
  panNumber?: string;
  panName?: string;
  panValidated: boolean;
  address?: { line1?: string; line2?: string; city?: string; state?: string; pincode?: string };
  onboardingStatus: 'REGISTERED' | 'PAN_SUBMITTED' | 'DOCUMENT_UPLOADED' | 'UNDER_REVIEW' | 'APPROVED' | 'REJECTED' | 'REUPLOAD_REQUIRED';
}

const investorProfileSchema = new Schema<IInvestorProfile>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true, index: true },
  fullName: { type: String, required: true },
  dateOfBirth: Date,
  panNumber: { type: String, unique: true, sparse: true, uppercase: true, index: true },
  panName: String,
  panValidated: { type: Boolean, default: false },
  address: { line1: String, line2: String, city: String, state: String, pincode: String },
  onboardingStatus: { type: String, enum: ['REGISTERED', 'PAN_SUBMITTED', 'DOCUMENT_UPLOADED', 'UNDER_REVIEW', 'APPROVED', 'REJECTED', 'REUPLOAD_REQUIRED'], default: 'REGISTERED', index: true },
}, { timestamps: true });

export const InvestorProfile = mongoose.model<IInvestorProfile>('InvestorProfile', investorProfileSchema);
