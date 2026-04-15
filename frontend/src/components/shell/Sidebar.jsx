"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import NavItem from "./NavItem";
import { useTheme } from "../providers/ThemeProvider";
import { logoutUser } from "@/lib/browser-auth";
import { useAuth } from "../providers/AuthProvider";
import { apiFetchDocuments } from "@/lib/blocks-api";

const NAV_ITEMS = [
  {
    href: "/dashboard",
    label: "Dashboard",
    icon: (
      <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
        <path d="M3 4.75A1.75 1.75 0 0 1 4.75 3h3.5A1.75 1.75 0 0 1 10 4.75v3.5A1.75 1.75 0 0 1 8.25 10h-3.5A1.75 1.75 0 0 1 3 8.25v-3.5Zm7 0A1.75 1.75 0 0 1 11.75 3h3.5A1.75 1.75 0 0 1 17 4.75v3.5A1.75 1.75 0 0 1 15.25 10h-3.5A1.75 1.75 0 0 1 10 8.25v-3.5Zm-7 7A1.75 1.75 0 0 1 4.75 10h3.5A1.75 1.75 0 0 1 10 11.75v3.5A1.75 1.75 0 0 1 8.25 17h-3.5A1.75 1.75 0 0 1 3 15.25v-3.5Zm7 0A1.75 1.75 0 0 1 11.75 10h3.5A1.75 1.75 0 0 1 17 11.75v3.5A1.75 1.75 0 0 1 15.25 17h-3.5A1.75 1.75 0 0 1 10 15.25v-3.5Z" />
      </svg>
    ),
  },
  {
    href: "/starred",
    label: "Starred Pages",
    icon: (
      <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 0 0 .95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 0 0-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.539 1.118l-2.8-2.034a1 1 0 0 0-1.176 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 0 0-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81H7.03a1 1 0 0 0 .95-.69l1.07-3.292Z" />
      </svg>
    ),
  },
];

export default function Sidebar({ open, onClose }) {
  const pathname = usePathname();
  const router = useRouter();
  const { mounted, theme, toggleTheme } = useTheme();
  const { clearAuthSession } = useAuth();
  const [starredDocs, setStarredDocs] = useState([]);
  const [loadingStarred, setLoadingStarred] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function loadStarred() {
      setLoadingStarred(true);
      try {
        const documents = await apiFetchDocuments({ starred: true });
        if (!cancelled) {
          setStarredDocs(documents ?? []);
          setLoadingStarred(false);
        }
      } catch {
        clearAuthSession();
        if (!cancelled) {
          setStarredDocs([]);
          setLoadingStarred(false);
        }
        router.replace("/login");
      }
    }

    loadStarred();
    return () => {
      cancelled = true;
    };
  }, [clearAuthSession, pathname, router]);

  async function logout() {
    await logoutUser();
    clearAuthSession();
    onClose?.();
    router.replace("/login");
    router.refresh();
  }

  return (
    <>
      <div
        className={`fixed inset-0 z-40 bg-[#1A1A1A]/45 transition-opacity lg:hidden ${
          open ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"
        }`}
        onClick={onClose}
      />

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-[18rem] flex-col rounded-r-[2rem] bg-[#2D2D2D] px-4 py-5 text-white shadow-[0_30px_90px_rgba(21,21,21,0.28)] transition-transform duration-300 lg:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between gap-3 px-2">
          <Link href="/dashboard" className="flex items-center gap-3" onClick={onClose}>
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10 text-lg font-semibold text-white">
              B
            </div>
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.22em] text-white/55">BlockNote</p>
              <p className="text-sm text-white/75">Workspace</p>
            </div>
          </Link>

          <button
            type="button"
            onClick={onClose}
            className="rounded-xl p-2 text-white/60 transition hover:bg-white/8 hover:text-white lg:hidden"
            aria-label="Close navigation"
          >
            <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path d="M5.22 5.22a.75.75 0 0 1 1.06 0L10 8.94l3.72-3.72a.75.75 0 1 1 1.06 1.06L11.06 10l3.72 3.72a.75.75 0 1 1-1.06 1.06L10 11.06l-3.72 3.72a.75.75 0 1 1-1.06-1.06L8.94 10 5.22 6.28a.75.75 0 0 1 0-1.06Z" />
            </svg>
          </button>
        </div>

        <nav className="mt-10 space-y-2">
          {NAV_ITEMS.map((item) => (
            <NavItem
              key={item.href}
              href={item.href}
              label={item.label}
              icon={item.icon}
              active={pathname === item.href}
              onNavigate={onClose}
            />
          ))}
        </nav>

        <section className="mt-8 px-2">
          <div className="mb-3 flex items-center justify-between">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/35">Starred</p>
            <span className="text-xs text-white/35">{starredDocs.length}</span>
          </div>

          <div className="space-y-1">
            {loadingStarred ? (
              <p className="rounded-2xl px-3 py-2 text-sm text-white/45">Loading…</p>
            ) : starredDocs.length === 0 ? (
              <p className="rounded-2xl px-3 py-2 text-sm text-white/45">No starred items</p>
            ) : (
              starredDocs.map((doc) => (
                <Link
                  key={doc.id}
                  href={`/documents/${doc.id}`}
                  onClick={onClose}
                  className="block truncate rounded-2xl px-3 py-2 text-sm text-white/72 transition hover:bg-white/8 hover:text-white"
                >
                  {doc.title}
                </Link>
              ))
            )}
          </div>
        </section>

        <div className="mt-auto space-y-3 px-1">
          <button
            type="button"
            onClick={toggleTheme}
            className="flex w-full items-center justify-between rounded-2xl border border-white/10 bg-white/6 px-4 py-3 text-sm font-medium text-white/82 transition hover:bg-white/10"
          >
            <span className="flex items-center gap-3">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/8">
                {mounted && theme === "dark" ? (
                  <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M10 2.75a.75.75 0 0 1 .75.75v1.25a.75.75 0 0 1-1.5 0V3.5a.75.75 0 0 1 .75-.75Zm0 12.5a.75.75 0 0 1 .75.75v1.25a.75.75 0 0 1-1.5 0V16a.75.75 0 0 1 .75-.75Zm7.25-4.5a.75.75 0 0 1 0 1.5H16a.75.75 0 0 1 0-1.5h1.25Zm-12.5 0a.75.75 0 0 1 0 1.5H3.5a.75.75 0 0 1 0-1.5h1.25Zm9.19-5.69a.75.75 0 0 1 1.06 1.06l-.884.884a.75.75 0 1 1-1.06-1.06l.884-.884ZM6.884 13.116a.75.75 0 0 1 1.06 1.06l-.884.884a.75.75 0 1 1-1.06-1.06l.884-.884Zm8.176 1.944a.75.75 0 0 1-1.06 0l-.884-.884a.75.75 0 0 1 1.06-1.06l.884.884a.75.75 0 0 1 0 1.06ZM7.944 6.884a.75.75 0 0 1-1.06 0L6 6a.75.75 0 1 1 1.06-1.06l.884.884a.75.75 0 0 1 0 1.06ZM10 6.5a3.5 3.5 0 1 1 0 7 3.5 3.5 0 0 1 0-7Z" />
                  </svg>
                ) : (
                  <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M11.78 3.72a.75.75 0 0 0-.94-.94A7.25 7.25 0 1 0 17.22 9.16a.75.75 0 0 0-.94-.94A5.75 5.75 0 0 1 11.78 3.72Z" />
                  </svg>
                )}
              </span>
              <span>Theme</span>
            </span>
            <span className="text-xs uppercase tracking-[0.18em] text-white/45">
              {mounted ? theme : "light"}
            </span>
          </button>

          <button
            type="button"
            onClick={logout}
            className="flex w-full items-center gap-3 rounded-2xl border border-red-400/18 bg-red-400/10 px-4 py-3 text-sm font-medium text-red-100 transition hover:bg-red-400/18"
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-black/10">
              <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                <path d="M3 4.75A1.75 1.75 0 0 1 4.75 3h5.5a.75.75 0 0 1 0 1.5h-5.5a.25.25 0 0 0-.25.25v10.5c0 .138.112.25.25.25h5.5a.75.75 0 0 1 0 1.5h-5.5A1.75 1.75 0 0 1 3 15.25V4.75Z" />
                <path d="M11.22 6.22a.75.75 0 0 1 1.06 0l3.25 3.25a.75.75 0 0 1 0 1.06l-3.25 3.25a.75.75 0 1 1-1.06-1.06l1.97-1.97H7.75a.75.75 0 0 1 0-1.5h5.44l-1.97-1.97a.75.75 0 0 1 0-1.06Z" />
              </svg>
            </span>
            Logout
          </button>
        </div>
      </aside>
    </>
  );
}
