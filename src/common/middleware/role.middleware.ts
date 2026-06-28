import { Response, NextFunction } from 'express';
import { AuthRequest } from './auth.middleware';
import { ApiError } from '../utils/apiError';

export const roleMiddleware = (...roles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) throw new ApiError(401, 'Unauthorized', 'UNAUTHORIZED');
    if (!roles.includes(req.user.role)) throw new ApiError(403, 'Access denied', 'FORBIDDEN');
    next();
  };
};
