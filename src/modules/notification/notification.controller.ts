import { Response } from 'express';
import { AuthRequest } from '../../common/middleware/auth.middleware';
import { successResponse } from '../../common/utils/apiResponse';
import * as service from './notification.service';

export const list = async (req: AuthRequest, res: Response) => successResponse(res, 'Notifications retrieved successfully', await service.getNotificationsByUser(req.user!.id));
export const markRead = async (req: AuthRequest, res: Response) => successResponse(res, 'Notification marked as read', await service.markNotificationRead(req.params.id, req.user!.id));
