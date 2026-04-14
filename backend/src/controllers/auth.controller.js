import {
  loginUser,
  registerUser,
  generateTokens,
  refreshUser,
} from "../services/auth.service.js";

import {
  setRefreshCookie,
  clearRefreshCookie,
  REFRESH_COOKIE_NAME,
} from "../lib/refresh-cookie.js";

export const login = async (req, res) => {
  try {
    const user = await loginUser(req.body.email, req.body.password);

    const { accessToken, refreshToken } = generateTokens(user.id);
    setRefreshCookie(res, refreshToken);

    res.json({ accessToken, user });
  } catch {
    res.status(401).json({ message: "Invalid credentials" });
  }
};

export const register = async (req, res) => {
  try {
    const user = await registerUser(req.body.email, req.body.password);

    const { accessToken, refreshToken } = generateTokens(user.id);
    setRefreshCookie(res, refreshToken);

    res.json({ accessToken, user });
  } catch (e) {
    res.status(400).json({ message: e.message });
  }
};

export const refresh = async (req, res) => {
  try {
    const raw = req.cookies[REFRESH_COOKIE_NAME];
    const user = await refreshUser(raw);

    const { accessToken, refreshToken } = generateTokens(user.id);
    setRefreshCookie(res, refreshToken);

    res.json({ accessToken, user });
  } catch {
    clearRefreshCookie(res);
    res.status(401).json({ message: "Invalid refresh token" });
  }
};

export const logout = (req, res) => {
  clearRefreshCookie(res);
  res.json({ ok: true });
};