import { prisma } from "../lib/prisma.js";
import { verifyPassword, hashPassword, validatePasswordRules } from "../lib/password.js";
import { signAccess, signRefresh, verifyRefresh } from "../lib/auth-tokens.js";

import { ApiError } from "../utils/ApiError.js";
import { HTTP } from "../utils/httpStatus.js";

export const loginUser = async (email, password) => {
  const user = await prisma.user.findUnique({
    where: { email: email.toLowerCase() },
  });

  if (!user || !(await verifyPassword(password, user.password_hash))) {
    throw new ApiError(HTTP.UNAUTHORIZED, "Invalid credentials");
  }

  return user;
};

export const registerUser = async (email, password) => {
  const existing = await prisma.user.findUnique({
    where: { email: email.toLowerCase() },
  });

  if (existing) {
    throw new ApiError(HTTP.CONFLICT, "User already exists");
  }

  const pwdErr = validatePasswordRules(password);
  if (pwdErr) {
    throw new ApiError(HTTP.UNPROCESSABLE_ENTITY, pwdErr);
  }

  const password_hash = await hashPassword(password);

  return prisma.user.create({
    data: { email: email.toLowerCase(), password_hash },
  });
};

export const generateTokens = (userId) => {
  return {
    accessToken: signAccess(userId),
    refreshToken: signRefresh(userId),
  };
};

export const refreshUser = async (token) => {
  const userId = verifyRefresh(token);

  if (!userId) {
    throw new ApiError(HTTP.UNAUTHORIZED, "Invalid refresh token");
  }

  const user = await prisma.user.findUnique({ where: { id: userId } });

  if (!user) {
    throw new ApiError(HTTP.NOT_FOUND, "User not found");
  }

  return user;
};