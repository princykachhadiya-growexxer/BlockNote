import { verifyAccess } from "./auth-tokens.js";

export function getUserIdFromRequest(req) {
  const auth = req.headers.authorization;
  if (!auth?.startsWith("Bearer ")) return null;
  return verifyAccess(auth.slice(7));
}
