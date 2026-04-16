"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/providers/AuthProvider";
import {
  apiFetchDocuments,
  apiPermanentlyDeleteDocument,
  apiRestoreDocument,
} from "@/lib/blocks-api";

function formatDeleted(iso) {
  try {
    return new Intl.DateTimeFormat(undefined, {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(new Date(iso));
  } catch {
    return iso;
  }
}

export default function TrashPage() {
  const router = useRouter();
  const { clearAuthSession } = useAuth();
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pendingRestoreIds, setPendingRestoreIds] = useState([]);
  const [pendingDeleteIds, setPendingDeleteIds] = useState([]);

  const load = useCallback(async () => {
    setError(null);
    try {
      const trashed = await apiFetchDocuments({ trashed: true });
      setDocuments(trashed);
      setLoading(false);
    } catch (err) {
      if (err?.status === 401) {
        clearAuthSession();
        router.replace("/login");
      } else {
        setError("Could not load trash.");
        setLoading(false);
      }
    }
  }, [clearAuthSession, router]);

  useEffect(() => {
    void load();
  }, [load]);

  async function restoreDocument(id) {
    if (pendingRestoreIds.includes(id)) return;
    setPendingRestoreIds((prev) => [...prev, id]);

    try {
      await apiRestoreDocument(id);
      await load();
    } catch (err) {
      if (err?.status === 401) {
        clearAuthSession();
        router.replace("/login");
      }
    } finally {
      setPendingRestoreIds((prev) => prev.filter((docId) => docId !== id));
    }
  }

  async function permanentlyDelete(id) {
    if (pendingDeleteIds.includes(id)) return;
    if (!confirm("Permanently delete this document? This cannot be undone.")) return;

    setPendingDeleteIds((prev) => [...prev, id]);
    try {
      await apiPermanentlyDeleteDocument(id);
      await load();
    } catch (err) {
      if (err?.status === 401) {
        clearAuthSession();
        router.replace("/login");
      }
    } finally {
      setPendingDeleteIds((prev) => prev.filter((docId) => docId !== id));
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-full flex-1 items-center justify-center text-sm text-[var(--muted)]">
        Loading trash…
      </div>
    );
  }

  return (
    <div className="min-h-full flex-1 px-4 py-8 sm:px-8">
      <div className="mx-auto max-w-5xl">
        <header className="rounded-[2rem] border border-[var(--edge)] bg-[linear-gradient(135deg,rgba(255,255,255,0.92),rgba(249,216,230,0.85),rgba(209,233,246,0.72))] px-6 py-6 shadow-[0_24px_70px_rgba(74,83,120,0.08)]">
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[var(--muted)]">Trash</p>
          <h1 className="mt-3 text-3xl font-semibold text-[var(--foreground)]">Recover documents when you need them back</h1>
          <p className="mt-2 text-sm leading-7 text-[var(--muted)]">
            Deleted pages stay here until you restore them or remove them permanently.
          </p>
        </header>

        {error ? <p className="mt-6 text-sm text-red-600">{error}</p> : null}

        {documents.length === 0 ? (
          <div className="mt-8 rounded-[1.75rem] border border-[var(--edge)] bg-[var(--surface)] p-10 text-center shadow-[0_18px_50px_rgba(74,83,120,0.08)]">
            <p className="text-base font-medium text-[var(--foreground)]">Trash is empty.</p>
            <p className="mt-2 text-sm text-[var(--muted)]">
              Documents you delete from the dashboard will appear here.
            </p>
            <Link
              href="/dashboard"
              className="mt-6 inline-flex rounded-2xl bg-[#2D2D2D] px-5 py-3 text-sm font-semibold text-white transition hover:bg-black"
            >
              Back to dashboard
            </Link>
          </div>
        ) : (
          <ul className="mt-8 space-y-3">
            {documents.map((doc) => (
              <li
                key={doc.id}
                className="rounded-[1.6rem] border border-[var(--edge)] bg-[var(--surface)] p-5 shadow-[0_18px_50px_rgba(74,83,120,0.08)]"
              >
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-lg font-semibold text-[var(--foreground)]">{doc.title}</p>
                    <p className="mt-2 text-xs text-[var(--muted)]">
                      Deleted {formatDeleted(doc.deleted_at || doc.updated_at)}
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => void restoreDocument(doc.id)}
                      disabled={pendingRestoreIds.includes(doc.id)}
                      className="inline-flex rounded-2xl bg-[#E1F0D7] px-4 py-2 text-sm font-semibold text-[#1A1A1A] transition hover:brightness-95 disabled:opacity-60"
                    >
                      Restore
                    </button>
                    <button
                      type="button"
                      onClick={() => void permanentlyDelete(doc.id)}
                      disabled={pendingDeleteIds.includes(doc.id)}
                      className="inline-flex rounded-2xl border border-[#F9D8E6] bg-[#F9D8E6]/80 px-4 py-2 text-sm font-semibold text-[#1A1A1A] transition hover:bg-[#F9D8E6] disabled:opacity-60"
                    >
                      Delete forever
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
