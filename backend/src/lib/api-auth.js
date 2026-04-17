import { verifyAccess } from "./auth-tokens.js";
import { ACCESS_COOKIE_NAME } from "./refresh-cookie.js";

export function getUserIdFromRequest(req) {
  const cookieToken = req.cookies?.[ACCESS_COOKIE_NAME];
  if (cookieToken) {
    const cookieUserId = verifyAccess(cookieToken);
    if (cookieUserId) return cookieUserId;
  }

  const auth = req.headers.authorization;
  if (!auth?.startsWith("Bearer ")) return null;
  return verifyAccess(auth.slice(7));
}
