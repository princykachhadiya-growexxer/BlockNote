import { ApiError } from "./ApiError.js";
import { HTTP } from "./httpStatus.js";

export function parseBooleanQuery(value, fieldName) {
  if (value == null || value === "") return false;
  if (typeof value === "boolean") return value;
  if (typeof value === "string") {
    const normalized = value.trim().toLowerCase();
    if (normalized === "true") return true;
    if (normalized === "false") return false;
  }

  throw new ApiError(
    HTTP.UNPROCESSABLE_ENTITY,
    `${fieldName} query param must be "true" or "false"`
  );
}
