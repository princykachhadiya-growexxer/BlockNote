// const ACCESS_KEY = "bn_access";

// export function getAccessToken() {
//   if (typeof window === "undefined") return null;
//   return localStorage.getItem(ACCESS_KEY);
// }

// export function setAccessToken(token) {
//   localStorage.setItem(ACCESS_KEY, token);
// }

// export function clearAccessToken() {
//   localStorage.removeItem(ACCESS_KEY);
// }

// export async function authFetch(input, init) {
//   const token = getAccessToken();
//   const headers = new Headers(init?.headers);
//   if (token) headers.set("Authorization", `Bearer ${token}`);

//   const doFetch = () =>
//     fetch(input, {
//       ...init,
//       headers,
//       credentials: "include",
//     });

//   let res = await doFetch();

//   if (res.status === 401) {
//     const refresh = await fetch("/api/auth/refresh", { method: "POST", credentials: "include" });
//     if (refresh.ok) {
//       const data = await refresh.json();
//       setAccessToken(data.accessToken);
//       headers.set("Authorization", `Bearer ${data.accessToken}`);
//       res = await doFetch();
//     }
//   }

//   return res;
// }

// const ACCESS_KEY = "bn_access";

// export function getAccessToken() {
//   if (typeof window === "undefined") return null;
//   return localStorage.getItem(ACCESS_KEY);
// }

// export function setAccessToken(token) {
//   localStorage.setItem(ACCESS_KEY, token);
// }

// export function clearAccessToken() {
//   localStorage.removeItem(ACCESS_KEY);
// }

// // ✅ added helper
// export function logoutUser() {
//   clearAccessToken();
// }

// export async function authFetch(input, init) {
//   const token = getAccessToken();
//   const headers = new Headers(init?.headers);

//   if (token) headers.set("Authorization", `Bearer ${token}`);

//   const doFetch = () =>
//     fetch(input, {
//       ...init,
//       headers,
//       credentials: "include",
//     });

//   let res = await doFetch();

//   if (res.status === 401) {
//     const refresh = await fetch("/api/auth/refresh", {
//       method: "POST",
//       credentials: "include",
//     });

//     if (refresh.ok) {
//       const data = await refresh.json();
//       setAccessToken(data.accessToken);
//       headers.set("Authorization", `Bearer ${data.accessToken}`);
//       res = await doFetch();
//     }
//   }

//   return res;
// }


const ACCESS_KEY = "bn_access";

// ─── Token storage ────────────────────────────────────────────────────────────

export function getAccessToken() {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(ACCESS_KEY);
}

export function setAccessToken(token) {
  localStorage.setItem(ACCESS_KEY, token);
}

export function clearAccessToken() {
  localStorage.removeItem(ACCESS_KEY);
}

// ─── Logout helper ────────────────────────────────────────────────────────────
// Clears the local token AND asks the server to invalidate the httpOnly
// refresh cookie.  Always resolves — network failures are swallowed
// intentionally so the UI can proceed regardless.

export async function logoutUser() {
  clearAccessToken();
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
// Attaches the current access token, and transparently retries once after
// refreshing if the server returns 401.

export async function authFetch(input, init) {
  const token = getAccessToken();
  const headers = new Headers(init?.headers);

  if (token) headers.set("Authorization", `Bearer ${token}`);

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
      const data = await refresh.json();
      setAccessToken(data.accessToken);
      headers.set("Authorization", `Bearer ${data.accessToken}`);
      res = await doFetch();
    } else {
      clearAccessToken();
    }
  }

  return res;
}
