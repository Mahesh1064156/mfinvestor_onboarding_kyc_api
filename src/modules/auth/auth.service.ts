import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { env } from '../../config/env';
import { ApiError } from '../../common/utils/apiError';
import { User } from './auth.model';
import { InvestorProfile } from '../investor/investor.model';
import { createAuditLog } from '../admin/admin.service';

export const registerInvestor = async (payload: any) => {
  const exists = await User.findOne({ $or: [{ email: payload.email }, { phone: payload.phone }] });
  if (exists) throw new ApiError(409, 'Email or phone already registered', 'DUPLICATE_USER');

  const password = await bcrypt.hash(payload.password, 10);
  const user = await User.create({ ...payload, password, role: 'INVESTOR' });
  await InvestorProfile.create({ userId: user._id, fullName: user.name });
  await createAuditLog({ actorId: user._id, actorRole: user.role, action: 'USER_REGISTERED', entityType: 'USER', entityId: user._id });
  return { userId: user._id, role: user.role };
};

export const login = async (payload: { email: string; password: string }) => {
  const user = await User.findOne({ email: payload.email });
  if (!user || !(await bcrypt.compare(payload.password, user.password))) throw new ApiError(401, 'Invalid login credentials', 'INVALID_CREDENTIALS');
  if (!user.isActive) throw new ApiError(403, 'User account is inactive', 'ACCOUNT_INACTIVE');

  const token = jwt.sign({ id: user._id.toString(), role: user.role, email: user.email }, env.jwtSecret, { expiresIn: env.jwtExpiresIn as any });
  await createAuditLog({ actorId: user._id, actorRole: user.role, action: 'USER_LOGGED_IN', entityType: 'USER', entityId: user._id });
  return { token, user: { id: user._id, name: user.name, role: user.role } };
};
