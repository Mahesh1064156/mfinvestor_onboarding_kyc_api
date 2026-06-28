import { z } from 'zod';

export const panSchema = z.object({
  panNumber: z.string().transform(v => v.toUpperCase()).refine(v => /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(v), 'Invalid PAN format'),
  panName: z.string().trim().min(2, 'PAN name is required'),
  dateOfBirth: z.string().min(1, 'Date of birth is required'),
});
