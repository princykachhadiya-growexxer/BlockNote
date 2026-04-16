"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import {
  getAccessToken,
  setAccessToken,
  clearAccessToken,
} from "@/lib/browser-auth";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  // user is null (logged-out) or an object (logged-in)
  const [user, setUser] = useState(null);
  // initialized becomes true once we've settled on an auth state
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    async function bootstrap() {
      try {
        const token = getAccessToken();
        let sessionRestored = false;

        if (token) {
          try {
            const res = await fetch("/api/auth/me", {
              headers: { Authorization: `Bearer ${token}` },
              credentials: "include",
            });

            if (res.ok) {
              const data = await res.json();
              setUser(data.user ?? null);
              sessionRestored = true;
            } else {
              clearAccessToken();
            }
          } catch {
            clearAccessToken();
          }
        }

        if (!sessionRestored) {
          try {
            const res = await fetch("/api/auth/refresh", {
              method: "POST",
              credentials: "include",
            });

            if (res.ok) {
              const data = await res.json();
              setAccessToken(data.accessToken);
              setUser(data.user ?? null);
            } else {
              clearAccessToken();
              setUser(null);
            }
          } catch {
            clearAccessToken();
            setUser(null);
          }
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
        setAccessToken(session.accessToken);
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
