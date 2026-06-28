import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IKycDocument extends Document {
  userId: Types.ObjectId;
  documentType: 'AADHAAR_FRONT' | 'AADHAAR_BACK' | 'PAN_CARD' | 'PHOTO';
  fileName: string;
  fileUrl: string;
  storagePath: string;
  mimeType: string;
  fileSize: number;
  uploadedAt: Date;
  verificationStatus: 'PENDING' | 'VERIFIED' | 'REJECTED';
}

const documentSchema = new Schema<IKycDocument>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  documentType: { type: String, enum: ['AADHAAR_FRONT', 'AADHAAR_BACK', 'PAN_CARD', 'PHOTO'], required: true, index: true },
  fileName: { type: String, required: true },
  fileUrl: { type: String, required: true },
  storagePath: { type: String, required: true },
  mimeType: { type: String, required: true },
  fileSize: { type: Number, required: true },
  uploadedAt: { type: Date, default: Date.now },
  verificationStatus: { type: String, enum: ['PENDING', 'VERIFIED', 'REJECTED'], default: 'PENDING', index: true },
});

documentSchema.index({ userId: 1, documentType: 1 });
export const KycDocument = mongoose.model<IKycDocument>('KycDocument', documentSchema);
