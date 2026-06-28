import { Response } from 'express';

export const successResponse = (res: Response, message: string, data: unknown = {}, statusCode = 200) => {
  return res.status(statusCode).json({ success: true, message, data });
};
