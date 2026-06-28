import { z } from 'zod';

export const registerSchema = z.object({
  name: z.string().trim().min(2, 'Name is required'),
  email: z.string().trim().email('Invalid email').toLowerCase(),
  phone: z.string().regex(/^[6-9][0-9]{9}$/, 'Invalid phone number'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

export const loginSchema = z.object({
  email: z.string().trim().email('Invalid email').toLowerCase(),
  password: z.string().min(1, 'Password is required'),
});
