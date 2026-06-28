import multer from 'multer';
import { ApiError } from '../utils/apiError';

const allowedMimeTypes = ['image/jpeg', 'image/png', 'application/pdf'];

export const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (!allowedMimeTypes.includes(file.mimetype)) return cb(new ApiError(400, 'Unsupported file type', 'VALIDATION_ERROR') as any);
    cb(null, true);
  },
});
