import { ApiError } from '../../common/utils/apiError';
import { InvestorProfile } from './investor.model';

export const getProfile = async (userId: string) => {
  const profile = await InvestorProfile.findOne({ userId });
  if (!profile) throw new ApiError(404, 'Investor profile not found', 'NOT_FOUND');
  return profile;
};
