export const ACCESS_COOKIE_NAME = "bn_access";
export const REFRESH_COOKIE_NAME = "bn_refresh";

const baseOpts = () => ({
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax",
  path: "/",
});

export function setAccessCookie(res, accessToken) {
  res.cookie(ACCESS_COOKIE_NAME, accessToken, {
    ...baseOpts(),
    maxAge: 15 * 60 * 1000,
  });
}

export function setRefreshCookie(res, refreshToken) {
  res.cookie(REFRESH_COOKIE_NAME, refreshToken, {
    ...baseOpts(),
    maxAge: 60 * 60 * 24 * 7 * 1000,
  });
}

export function clearAccessCookie(res) {
  res.clearCookie(ACCESS_COOKIE_NAME, baseOpts());
}

export function clearRefreshCookie(res) {
  res.clearCookie(REFRESH_COOKIE_NAME, baseOpts());
}
