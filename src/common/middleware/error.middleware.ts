import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { ApiError } from '../utils/apiError';

export const errorMiddleware = (err: any, req: Request, res: Response, next: NextFunction) => {
  if (err instanceof ZodError) {
    return res.status(400).json({ success: false, message: err.errors[0]?.message || 'Validation error', error: { code: 'VALIDATION_ERROR' } });
  }

  if (err instanceof ApiError) {
    return res.status(err.statusCode).json({ success: false, message: err.message, error: { code: err.code } });
  }

  if (err?.code === 11000) {
    return res.status(409).json({ success: false, message: 'Duplicate value already exists', error: { code: 'DUPLICATE_KEY' } });
  }

  console.error(err);
  return res.status(500).json({ success: false, message: 'Internal Server Error', error: { code: 'INTERNAL_SERVER_ERROR' } });
};
