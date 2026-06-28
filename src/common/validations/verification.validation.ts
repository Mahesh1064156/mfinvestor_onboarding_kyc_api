import { z } from 'zod';

export const verificationStatusSchema = z.object({
  status: z.enum(['UNDER_REVIEW', 'APPROVED', 'REJECTED', 'REUPLOAD_REQUIRED']),
  remarks: z.string().trim().optional().default(''),
});
