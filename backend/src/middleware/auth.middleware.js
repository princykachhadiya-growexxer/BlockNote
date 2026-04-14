import { getUserIdFromRequest } from "../lib/api-auth.js";
import { ApiError } from "../utils/ApiError.js";
import { HTTP } from "../utils/httpStatus.js";

export const requireAuth = (req, res, next) => {
  const userId = getUserIdFromRequest(req);
  if (!userId) {
    throw new ApiError(HTTP.UNAUTHORIZED, "Unauthorized");
  }
  req.userId = userId;
  next();
};