const ACCESS_KEY = "bn_access";

function clearLegacyAccessToken() {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(ACCESS_KEY);
  } catch {
    // Ignore storage failures while cleaning up legacy token state.
  }
}

// Keep these exports for backward compatibility with existing frontend code
// paths while moving the real access token to an httpOnly cookie.
export function getAccessToken() {
  return null;
}

export function setAccessToken(_token) {
  clearLegacyAccessToken();
}

export function clearAccessToken() {
  clearLegacyAccessToken();
}

// ─── Logout helper ────────────────────────────────────────────────────────────
// Clears the local token AND asks the server to invalidate the httpOnly
// refresh cookie.  Always resolves — network failures are swallowed
// intentionally so the UI can proceed regardless.

export async function logoutUser() {
  clearLegacyAccessToken();
  try {
    await fetch("/api/auth/logout", {
      method: "POST",
      credentials: "include",
    });
  } catch {
    // Ignore — we've already cleared the local token above
  }
}

// ─── Authenticated fetch ──────────────────────────────────────────────────────
// Sends cookies on every request and transparently retries once after
// refreshing if the server returns 401.

export async function authFetch(input, init) {
  const headers = new Headers(init?.headers);

  const doFetch = () =>
    fetch(input, {
      ...init,
      headers,
      credentials: "include",
    });

  let res = await doFetch();

  if (res.status === 401) {
    const refresh = await fetch("/api/auth/refresh", {
      method: "POST",
      credentials: "include",
    });

    if (refresh.ok) {
      clearLegacyAccessToken();
      res = await doFetch();
    } else {
      clearLegacyAccessToken();
    }
  }

  return res;
}
