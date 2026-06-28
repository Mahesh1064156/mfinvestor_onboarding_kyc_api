import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IVerificationRequest extends Document {
  investorId: Types.ObjectId;
  officerId?: Types.ObjectId;
  status: 'PENDING' | 'UNDER_REVIEW' | 'APPROVED' | 'REJECTED' | 'REUPLOAD_REQUIRED';
  remarks?: string;
  reviewedAt?: Date;
}

const verificationRequestSchema = new Schema<IVerificationRequest>({
  investorId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  officerId: { type: Schema.Types.ObjectId, ref: 'User', index: true },
  status: { type: String, enum: ['PENDING', 'UNDER_REVIEW', 'APPROVED', 'REJECTED', 'REUPLOAD_REQUIRED'], default: 'PENDING', index: true },
  remarks: String,
  reviewedAt: Date,
}, { timestamps: true });

verificationRequestSchema.index({ investorId: 1, status: 1 });
export const VerificationRequest = mongoose.model<IVerificationRequest>('VerificationRequest', verificationRequestSchema);
