import { Request, Response } from 'express';
import { registerSchema, loginSchema } from '../../common/validations/auth.validation';
import { successResponse } from '../../common/utils/apiResponse';
import * as service from './auth.service';

export const register = async (req: Request, res: Response) => successResponse(res, 'Registration successful', await service.registerInvestor(registerSchema.parse(req.body)), 201);
export const login = async (req: Request, res: Response) => successResponse(res, 'Login successful', await service.login(loginSchema.parse(req.body)));
