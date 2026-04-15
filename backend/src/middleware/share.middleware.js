import { ApiError } from "../utils/ApiError.js";
import { HTTP } from "../utils/httpStatus.js";

export function rejectShareWrites(req, _res, next) {
  const shareHeader = req.get("x-share-token");
  const shareQuery = req.query?.shareToken;

  if (shareHeader || shareQuery) {
    return next(new ApiError(HTTP.FORBIDDEN, "Shared links are read-only"));
  }

  return next();
}
