import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import { env } from "../../config/env";
import { ApiError } from "../../common/utils/apiError";
import { User } from "./auth.model";
import { InvestorProfile } from "../investor/investor.model";
import { createAuditLog } from "../admin/admin.service";

export const registerInvestor = async (payload: any) => {
  const exists = await User.findOne({
    $or: [{ email: payload.email }, { phone: payload.phone }],
  });
  if (exists)
    throw new ApiError(
      409,
      "Email or phone already registered",
      "DUPLICATE_USER",
    );

  const password = await bcrypt.hash(payload.password, 10);
  const user = await User.create({ ...payload, password, role: "INVESTOR" });
  await InvestorProfile.create({ userId: user._id, fullName: user.name });
  await createAuditLog({
    actorId: user._id,
    actorRole: user.role,
    action: "USER_REGISTERED",
    entityType: "USER",
    entityId: user._id,
  });
  return { userId: user._id, role: user.role };
};

export const login = async (payload: { email: string; password: string }) => {
  const user = await User.findOne({ email: payload.email });
  console.log(user);
  if (!user || !(await bcrypt.compare(payload.password, user.password)))
    throw new ApiError(401, "Invalid login credentials", "INVALID_CREDENTIALS");
  if (!user.isActive)
    throw new ApiError(403, "User account is inactive", "ACCOUNT_INACTIVE");

  const token = jwt.sign(
    { id: user._id.toString(), role: user.role, email: user.email },
    env.jwtSecret,
    { expiresIn: env.jwtExpiresIn as any },
  );
  await createAuditLog({
    actorId: user._id,
    actorRole: user.role,
    action: "USER_LOGGED_IN",
    entityType: "USER",
    entityId: user._id,
  });
  return { token, user: { id: user._id, name: user.name, role: user.role } };
};
export const forgotPassword = async (email: string) => {
  const user = await User.findOne({ email });
  if (!user) throw new ApiError(404, "User not found", "USER_NOT_FOUND");
  const token = crypto.randomBytes(32).toString("hex");
  user.resetPasswordToken = token;
  user.resetPasswordExpires = new Date(Date.now() + 15 * 60 * 1000); // 15 mins
  await user.save();
  return {
    message: "Password reset token generated",
    resetToken: token,
  };
};
export const resetPassword = async (payload: {
  token: string;
  newPassword: string;
}) => {
  const user = await User.findOne({
    resetPasswordToken: payload.token,
    resetPasswordExpires: { $gt: new Date() },
  });
  if (!user) {
    throw new ApiError(400, "Invalid or expired token", "INVALID_TOKEN");
  }
  const hashedPassword = await bcrypt.hash(payload.newPassword, 10);
  user.password = hashedPassword;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpires = undefined;
  await user.save();
  return { message: "Password reset successful" };
};
