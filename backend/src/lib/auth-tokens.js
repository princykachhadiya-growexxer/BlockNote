import jwt from "jsonwebtoken";

function accessSecret() {
  const s = process.env.JWT_ACCESS_SECRET;
  if (!s) throw new Error("JWT_ACCESS_SECRET is not set");
  return s;
}

function refreshSecret() {
  const s = process.env.JWT_REFRESH_SECRET;
  if (!s) throw new Error("JWT_REFRESH_SECRET is not set");
  return s;
}

export function signAccess(userId) {
  return jwt.sign({ sub: userId, typ: "access" }, accessSecret(), { expiresIn: "15m" });
}

export function signRefresh(userId) {
  return jwt.sign({ sub: userId, typ: "refresh" }, refreshSecret(), { expiresIn: "7d" });
}

export function verifyAccess(token) {
  try {
    const p = jwt.verify(token, accessSecret());
    return p.typ === "access" ? p.sub : null;
  } catch {
    return null;
  }
}

export function verifyRefresh(token) {
  try {
    const p = jwt.verify(token, refreshSecret());
    return p.typ === "refresh" ? p.sub : null;
  } catch {
    return null;
  }
}
