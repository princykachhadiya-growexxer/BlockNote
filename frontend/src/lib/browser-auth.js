const ACCESS_KEY = "bn_access";

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
    const refresh = await fetch("/api/auth/refresh", { method: "POST", credentials: "include" });
    if (refresh.ok) {
      const data = await refresh.json();
      setAccessToken(data.accessToken);
      headers.set("Authorization", `Bearer ${data.accessToken}`);
      res = await doFetch();
    }
  }

  return res;
}
