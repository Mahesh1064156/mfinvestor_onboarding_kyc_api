import mongoose, { Schema, Document, Types } from 'mongoose';

export interface INotification extends Document {
  userId: Types.ObjectId;
  title: string;
  message: string;
  type: string;
  isRead: boolean;
}

const notificationSchema = new Schema<INotification>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  title: { type: String, required: true },
  message: { type: String, required: true },
  type: { type: String, default: 'KYC_STATUS' },
  isRead: { type: Boolean, default: false },
}, { timestamps: true });

export const Notification = mongoose.model<INotification>('Notification', notificationSchema);
