"use client";

import { useEffect, useMemo, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import Sidebar from "./Sidebar";
import { useAuth } from "../providers/AuthProvider";

const PUBLIC_ROUTES = ["/", "/login", "/register"];

function isPublicRoute(pathname) {
  if (PUBLIC_ROUTES.includes(pathname)) return true;
  return pathname.startsWith("/share/");
}

export default function AppShell({ children }) {
  const pathname = usePathname();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { initialized, isAuthenticated } = useAuth();

  const publicRoute = useMemo(() => isPublicRoute(pathname), [pathname]);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted || !initialized) return;

    if ((pathname === "/login" || pathname === "/register") && isAuthenticated) {
      router.replace("/dashboard");
      return;
    }

    if (!publicRoute && !isAuthenticated) {
      router.replace("/login");
    }
  }, [initialized, isAuthenticated, mounted, pathname, publicRoute, router]);

  useEffect(() => {
    setSidebarOpen(false);
  }, [pathname]);

  const showSidebar = mounted && initialized && isAuthenticated && !publicRoute;

  if (!mounted || !initialized) {
    return <div className="min-h-full flex flex-1 flex-col">{children}</div>;
  }

  return (
    <div className="min-h-full flex flex-1 bg-[var(--app-bg)] text-[var(--foreground)]">
      {showSidebar ? (
        <>
          <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
          <div className="hidden w-[18rem] shrink-0 lg:block" />
        </>
      ) : null}

      <div className="flex min-h-full min-w-0 flex-1 flex-col">
        {showSidebar ? (
          <div className="sticky top-0 z-30 flex items-center justify-between border-b border-[var(--edge)] bg-[var(--surface)]/90 px-4 py-3 backdrop-blur lg:hidden">
            <button
              type="button"
              onClick={() => setSidebarOpen(true)}
              className="rounded-xl border border-[var(--edge)] bg-[var(--surface)] px-3 py-2 text-sm font-medium text-[var(--foreground)] transition hover:bg-[var(--surface-muted)]"
            >
              Menu
            </button>
            <span className="text-sm font-semibold tracking-[0.18em] text-[var(--muted)] uppercase">
              BlockNote
            </span>
          </div>
        ) : null}

        <div className="flex min-h-full flex-1 flex-col">{children}</div>
      </div>
    </div>
  );
}
