import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
  name: string;
  email: string;
  phone: string;
  password: string;
  role: 'INVESTOR' | 'OFFICER' | 'ADMIN';
  isActive: boolean;
}

const userSchema = new Schema<IUser>({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  phone: { type: String, required: true, unique: true, trim: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['INVESTOR', 'OFFICER', 'ADMIN'], default: 'INVESTOR', index: true },
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

export const User = mongoose.model<IUser>('User', userSchema);
