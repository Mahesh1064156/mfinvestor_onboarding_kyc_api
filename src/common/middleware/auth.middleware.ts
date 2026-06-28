import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../../config/env';
import { ApiError } from '../utils/apiError';

export interface AuthRequest extends Request {
  user?: { id: string; role: 'INVESTOR' | 'OFFICER' | 'ADMIN'; email: string };
}

export const authMiddleware = (req: AuthRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) throw new ApiError(401, 'Authorization token missing', 'UNAUTHORIZED');

  try {
    req.user = jwt.verify(authHeader.split(' ')[1], env.jwtSecret) as AuthRequest['user'];
    next();
  } catch {
    throw new ApiError(401, 'Invalid or expired token', 'UNAUTHORIZED');
  }
};
