"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { clearAccessToken } from "@/lib/browser-auth";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  // user is null (logged-out) or an object (logged-in)
  const [user, setUser] = useState(null);
  // initialized becomes true once we've settled on an auth state
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    async function bootstrap() {
      try {
        try {
          const me = await fetch("/api/auth/me", {
            credentials: "include",
          });

          if (me.ok) {
            const data = await me.json();
            clearAccessToken();
            setUser(data.user ?? null);
            return;
          }
        } catch {
          // Fall through to refresh so existing refresh-cookie sessions can
          // still bootstrap without changing the UX.
        }

        try {
          const res = await fetch("/api/auth/refresh", {
            method: "POST",
            credentials: "include",
          });

          if (res.ok) {
            const data = await res.json();
            clearAccessToken();
            setUser(data.user ?? null);
          } else {
            clearAccessToken();
            setUser(null);
          }
        } catch {
          clearAccessToken();
          setUser(null);
        }
      } finally {
        setInitialized(true);
      }
    }

    bootstrap();
  }, []);

  const value = useMemo(
    () => ({
      user,
      initialized,
      isAuthenticated: Boolean(user),

      /** Call after a successful login or register API response. */
      setAuthSession(session) {
        clearAccessToken();
        setUser(session.user ?? null);
      },

      /** Call on logout — clears state AND the access token. */
      clearAuthSession() {
        clearAccessToken();
        setUser(null);
      },
    }),
    [initialized, user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}
