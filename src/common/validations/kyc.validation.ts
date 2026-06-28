import { z } from 'zod';

export const documentUploadSchema = z.object({
  documentType: z.enum(['AADHAAR_FRONT', 'AADHAAR_BACK', 'PAN_CARD', 'PHOTO']),
});
