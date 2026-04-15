"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/providers/AuthProvider";
import { apiFetchDocuments, apiToggleDocumentStar } from "@/lib/blocks-api";

export default function StarredPages() {
  const router = useRouter();
  const { clearAuthSession, initialized, isAuthenticated } = useAuth();
  const [docs, setDocs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pendingRemoveIds, setPendingRemoveIds] = useState([]);

  const load = useCallback(async () => {
    setError(null);
    try {
      const documents = await apiFetchDocuments({ starred: true });
      setDocs(documents);
      setLoading(false);
    } catch {
      clearAuthSession();
      router.replace("/login");
      setError("Could not load starred pages.");
      setLoading(false);
    }
  }, [clearAuthSession, router]);

  useEffect(() => {
    if (!initialized) return;
    if (!isAuthenticated) {
      router.replace("/login");
      return;
    }
    void load();
  }, [initialized, isAuthenticated, load, router]);

  async function removeStar(id) {
    if (pendingRemoveIds.includes(id)) return;
    const previous = docs;
    setPendingRemoveIds((prev) => [...prev, id]);
    setDocs((prev) => prev.filter((doc) => doc.id !== id));
    try {
      await apiToggleDocumentStar(id);
    } catch {
      setDocs(previous);
    } finally {
      setPendingRemoveIds((prev) => prev.filter((docId) => docId !== id));
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-full flex-1 items-center justify-center bg-[var(--app-bg)] text-sm text-[var(--muted)]">
        Loading starred pages…
      </div>
    );
  }

  return (
    <div className="min-h-full flex-1 bg-[var(--app-bg)] px-4 py-8 sm:px-8">
      <div className="mx-auto max-w-5xl">
        <header className="rounded-[2rem] border border-[var(--edge)] bg-[var(--surface)]/86 px-6 py-6 shadow-[0_24px_70px_rgba(74,83,120,0.08)] backdrop-blur">
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[var(--muted)]">Starred Pages</p>
          <h1 className="mt-3 text-3xl font-semibold text-[var(--foreground)]">Your important documents</h1>
          <p className="mt-2 text-sm leading-7 text-[var(--muted)]">
            Keep frequently used pages close by for faster access.
          </p>
        </header>

        {error ? <p className="mt-6 text-sm text-red-600">{error}</p> : null}

        {docs.length === 0 ? (
          <div className="mt-8 rounded-[1.75rem] border border-[var(--edge)] bg-[var(--surface)] p-10 text-center shadow-[0_18px_50px_rgba(74,83,120,0.08)]">
            <p className="text-base font-medium text-[var(--foreground)]">No starred pages yet.</p>
            <p className="mt-2 text-sm text-[var(--muted)]">Star documents from the dashboard to keep them here.</p>
            <Link
              href="/dashboard"
              className="mt-6 inline-flex rounded-2xl bg-[#2D2D2D] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#1F1F1F]"
            >
              Go to dashboard
            </Link>
          </div>
        ) : (
          <ul className="mt-8 space-y-3">
            {docs.map((doc) => (
              <li
                key={doc.id}
                className="flex flex-col gap-4 rounded-[1.6rem] border border-[var(--edge)] bg-[var(--surface)] p-5 shadow-[0_18px_50px_rgba(74,83,120,0.08)] sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <p className="text-base font-semibold text-[var(--foreground)]">{doc.title}</p>
                  <p className="mt-2 text-xs text-[var(--muted)]">Pinned to your sidebar workflow</p>
                </div>
                <div className="flex gap-2">
                  <Link
                    href={`/documents/${doc.id}`}
                    className="inline-flex items-center justify-center rounded-2xl border border-[var(--edge)] px-4 py-2 text-sm font-medium text-[var(--foreground)] hover:bg-[var(--surface-muted)]"
                  >
                    Open
                  </Link>
                  <button
                    type="button"
                    onClick={() => void removeStar(doc.id)}
                    disabled={pendingRemoveIds.includes(doc.id)}
                    className="inline-flex items-center justify-center rounded-2xl border border-[#F9D8E6] bg-[#F9D8E6] px-4 py-2 text-sm font-medium text-[#1A1A1A] hover:opacity-90 disabled:opacity-60"
                  >
                    Remove star
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
