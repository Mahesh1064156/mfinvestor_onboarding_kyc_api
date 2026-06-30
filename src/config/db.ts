import mongoose from 'mongoose';
import { env } from './env';

export const connectDB = async (): Promise<void> => {
  console.log(`uri${env.mongoUri}`);
  await mongoose.connect(env.mongoUri);
  console.log('MongoDB connected');
};
