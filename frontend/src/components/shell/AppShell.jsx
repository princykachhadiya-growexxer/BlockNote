"use client";

import { useEffect, useMemo, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import Sidebar from "./Sidebar";
import { useAuth } from "../providers/AuthProvider";

// Routes that do NOT require authentication
const PUBLIC_PATHS = new Set(["/", "/login", "/register"]);

function isPublicPath(pathname) {
  if (PUBLIC_PATHS.has(pathname)) return true;
  // Share links are always public
  if (pathname.startsWith("/share/")) return true;
  return false;
}

// Full-screen neutral splash shown while we determine auth state.
// Keeps the same background colour as the app so there's no colour flash.
function AuthGate() {
  return (
    <div className="flex min-h-full flex-1 items-center justify-center bg-[var(--app-bg)]">
      <span className="text-sm text-[var(--muted)]">Loading…</span>
    </div>
  );
}

export default function AppShell({ children }) {
  const pathname = usePathname();
  const router = useRouter();
  const { initialized, isAuthenticated } = useAuth();
  const [sidebarState, setSidebarState] = useState({
    pathname,
    open: false,
  });

  const publicPath = useMemo(() => isPublicPath(pathname), [pathname]);
  const sidebarOpen = sidebarState.pathname === pathname ? sidebarState.open : false;

  // ── Route guards ────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!initialized) return; // wait until we know auth state

    // Logged-in user visits a public auth page → go to dashboard
    if (isAuthenticated && (pathname === "/login" || pathname === "/register")) {
      router.replace("/dashboard");
      return;
    }

    // Unauthenticated user visits a protected page → go to login
    if (!isAuthenticated && !publicPath) {
      router.replace("/login");
    }
  }, [initialized, isAuthenticated, pathname, publicPath, router]);

  // ── Render decisions ────────────────────────────────────────────────────────

  // While auth is not settled, show a neutral splash only for protected routes
  // Public routes like / should render immediately without blocking
  if (!initialized && !publicPath) {
    return <AuthGate />;
  }

  // After initialization: if we're about to redirect on protected routes, don't render children
  // (avoids a brief flash of the wrong page while Next.js processes the push).
  // For public routes, allow rendering and redirect via useEffect to avoid loading gate.
  const willRedirect =
    (isAuthenticated && (pathname === "/login" || pathname === "/register")) ||
    (!isAuthenticated && !publicPath);

  if (willRedirect && !publicPath) {
    return <AuthGate />;
  }

  const showSidebar = isAuthenticated && !publicPath;

  return (
    <div className="min-h-full flex flex-1 bg-[var(--app-bg)] text-[var(--foreground)]">
      {showSidebar && (
        <>
          <Sidebar
            open={sidebarOpen}
            onClose={() => setSidebarState({ pathname, open: false })}
          />
          {/* Spacer that matches the fixed sidebar width on large screens */}
          <div className="hidden w-[18rem] shrink-0 lg:block" />
        </>
      )}

      <div className="flex min-h-full min-w-0 flex-1 flex-col">
        {/* Mobile top-bar — only rendered inside the app shell */}
        {showSidebar && (
          <div className="sticky top-0 z-30 flex items-center justify-between border-b border-[var(--edge)] bg-[var(--surface)]/90 px-4 py-3 backdrop-blur lg:hidden">
            <button
              type="button"
              onClick={() => setSidebarState({ pathname, open: true })}
              className="rounded-xl border border-[var(--edge)] bg-[var(--surface)] px-3 py-2 text-sm font-medium text-[var(--foreground)] transition hover:bg-[var(--surface-muted)]"
            >
              Menu
            </button>
            <span className="text-sm font-semibold tracking-[0.18em] text-[var(--muted)] uppercase">
              BlockNote
            </span>
          </div>
        )}

        <div className="flex min-h-full flex-1 flex-col">{children}</div>
      </div>
    </div>
  );
}
