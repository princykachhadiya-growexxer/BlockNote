"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import {
  clearSession,
  getAccessToken,
  getStoredUser,
  setSession,
} from "@/lib/browser-auth";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function bootstrap() {
      const token = getAccessToken();
      const storedUser = getStoredUser();

      if (token && storedUser) {
        if (!cancelled) {
          setUser(storedUser);
          setInitialized(true);
        }
        return;
      }

      try {
        const res = await fetch("/api/auth/refresh", {
          method: "POST",
          credentials: "include",
        });

        if (!res.ok) {
          clearSession();
          if (!cancelled) setInitialized(true);
          return;
        }

        const data = await res.json();
        setSession(data);
        if (!cancelled) {
          setUser(data.user ?? null);
          setInitialized(true);
        }
      } catch {
        clearSession();
        if (!cancelled) setInitialized(true);
      }
    }

    bootstrap();
    return () => {
      cancelled = true;
    };
  }, []);

  const value = useMemo(
    () => ({
      user,
      initialized,
      isAuthenticated: Boolean(user),
      setAuthSession(session) {
        setSession(session);
        setUser(session.user ?? null);
      },
      clearAuthSession() {
        clearSession();
        setUser(null);
      },
    }),
    [initialized, user]
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
