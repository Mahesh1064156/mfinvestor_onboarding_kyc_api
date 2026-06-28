import { Request, Response } from 'express';
import { successResponse } from '../../common/utils/apiResponse';
import * as service from './admin.service';

export const dashboard = async (req: Request, res: Response) => successResponse(res, 'Dashboard summary retrieved successfully', await service.getDashboardSummary());
export const auditLogs = async (req: Request, res: Response) => successResponse(res, 'Audit logs retrieved successfully', await service.getAuditLogs());
