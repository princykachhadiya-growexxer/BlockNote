"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { authFetch } from "@/lib/browser-auth";
import { useAuth } from "@/components/providers/AuthProvider";
import { apiToggleDocumentStar } from "@/lib/blocks-api";

function formatUpdated(iso) {
  try {
    return new Intl.DateTimeFormat(undefined, {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(new Date(iso));
  } catch {
    return iso;
  }
}

export default function DashboardPage() {
  const router = useRouter();
  // Use the shared auth context — AppShell already guards this route,
  // but we still need clearAuthSession for the inline logout button.
  const { clearAuthSession } = useAuth();

  const [docs, setDocs] = useState(null);
  const [loadError, setLoadError] = useState(null);
  const [creating, setCreating] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editTitle, setEditTitle] = useState("");
  const [pendingStarIds, setPendingStarIds] = useState([]);

  // ── Auth error handler ─────────────────────────────────────────────────────
  function handleUnauthorized() {
    clearAuthSession();
    router.replace("/login");
  }

  // ── Data loading ───────────────────────────────────────────────────────────
  const load = useCallback(async () => {
    setLoadError(null);
    const res = await authFetch("/api/documents");
    if (res.status === 401) {
      handleUnauthorized();
      return;
    }
    if (!res.ok) {
      setLoadError("Could not load documents.");
      return;
    }
    const data = await res.json();
    setDocs(data.documents);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  // ── Actions ────────────────────────────────────────────────────────────────
  async function createDoc() {
    setCreating(true);
    try {
      const res = await authFetch("/api/documents", { method: "POST" });
      if (res.status === 401) { handleUnauthorized(); return; }
      if (!res.ok) return;
      await load();
    } finally {
      setCreating(false);
    }
  }

  async function deleteDoc(id) {
    if (!confirm("Delete this document?")) return;
    const res = await authFetch(`/api/documents/${id}`, { method: "DELETE" });
    if (res.status === 401) { handleUnauthorized(); return; }
    if (!res.ok) return;
    await load();
  }

  async function toggleStar(id) {
    if (pendingStarIds.includes(id)) return;

    const previousDocs = docs ?? [];
    setPendingStarIds((prev) => [...prev, id]);
    setDocs((prev) =>
      (prev ?? []).map((doc) =>
        doc.id === id ? { ...doc, isStarred: !doc.isStarred } : doc
      )
    );

    try {
      const result = await apiToggleDocumentStar(id);
      setDocs((prev) =>
        (prev ?? []).map((doc) =>
          doc.id === id ? { ...doc, isStarred: result.isStarred } : doc
        )
      );
    } catch (err) {
      setDocs(previousDocs);
      if (err?.status === 401) {
        handleUnauthorized();
      }
    } finally {
      setPendingStarIds((prev) => prev.filter((docId) => docId !== id));
    }
  }

  function startRename(d) {
    setEditingId(d.id);
    setEditTitle(d.title);
  }

  async function commitRename(id) {
    const title = editTitle.trim();
    if (!title) {
      setEditingId(null);
      await load();
      return;
    }
    const res = await authFetch(`/api/documents/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title }),
    });
    setEditingId(null);
    if (res.status === 401) { handleUnauthorized(); return; }
    await load();
  }

  // ── Loading / error states ─────────────────────────────────────────────────
  if (docs === null && !loadError) {
    return (
      <div className="flex min-h-full flex-1 items-center justify-center bg-[var(--app-bg)] text-sm text-[var(--muted)]">
        Loading documents…
      </div>
    );
  }

  return (
    <div className="min-h-full flex-1 bg-[var(--app-bg)] px-4 py-10 sm:px-8">
      <div className="mx-auto max-w-3xl">
        <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-[var(--foreground)]">
              Your documents 📄
            </h1>
            <p className="mt-1 text-sm text-[var(--muted)]">
              Create, rename, or delete documents.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => void createDoc()}
              disabled={creating}
              className="rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white hover:bg-accent-hover disabled:opacity-60"
            >
              {creating ? "Creating…" : "+ New"}
            </button>
          </div>
        </header>

        {loadError ? (
          <p className="mt-6 text-sm text-red-600">{loadError}</p>
        ) : null}

        <ul className="mt-8 space-y-2">
          {(docs ?? []).map((d) => (
            <li
              key={d.id}
              className="flex flex-col gap-3 rounded-xl border border-[var(--edge)] bg-[var(--surface)] p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="min-w-0 flex-1">
                <div className="flex items-start gap-2">
                  <button
                    type="button"
                    onClick={() => void toggleStar(d.id)}
                    disabled={pendingStarIds.includes(d.id)}
                    className={`mt-0.5 inline-flex shrink-0 rounded-lg p-1 transition ${
                      d.isStarred
                        ? "text-[#1A1A1A]"
                        : "text-[var(--muted)] hover:bg-[var(--surface-muted)] hover:text-[var(--foreground)]"
                    } disabled:opacity-60`}
                    aria-label={d.isStarred ? "Remove star from document" : "Star document"}
                  >
                    <svg className="h-4 w-4" viewBox="0 0 20 20" fill={d.isStarred ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1.5">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 0 0 .95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 0 0-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.539 1.118l-2.8-2.034a1 1 0 0 0-1.176 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 0 0-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81H7.03a1 1 0 0 0 .95-.69l1.07-3.292Z" />
                    </svg>
                  </button>
                  <div className="min-w-0 flex-1">
                    {editingId === d.id ? (
                      <input
                        autoFocus
                        value={editTitle}
                        onChange={(e) => setEditTitle(e.target.value)}
                        onBlur={() => void commitRename(d.id)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") e.target.blur();
                          if (e.key === "Escape") {
                            setEditingId(null);
                            void load();
                          }
                        }}
                        className="w-full rounded-md border border-[var(--edge)] bg-[var(--surface)] px-2 py-1 text-sm font-medium text-[var(--foreground)] outline-none ring-zinc-400 focus:ring-2"
                      />
                    ) : (
                      <button
                        type="button"
                        onClick={() => startRename(d)}
                        className="block w-full truncate text-left text-sm font-medium text-[var(--foreground)] underline-offset-2 hover:underline"
                        title="Click to rename"
                      >
                        {d.title}
                      </button>
                    )}
                  </div>
                </div>
                <p className="mt-1 text-xs text-[var(--muted)]">
                  Updated {formatUpdated(d.updated_at)}
                </p>
              </div>

              <div className="flex shrink-0 gap-2">
                <Link
                  href={`/documents/${d.id}`}
                  className="inline-flex items-center justify-center rounded-lg border border-[var(--edge)] px-3 py-1.5 text-sm font-medium text-[var(--foreground)] hover:bg-[var(--surface-muted)]"
                >
                  Open
                </Link>
                <button
                  type="button"
                  onClick={() => void deleteDoc(d.id)}
                  className="inline-flex items-center justify-center rounded-lg border border-red-200 bg-red-50 px-3 py-1.5 text-sm font-medium text-red-800 hover:bg-red-100"
                >
                  Delete
                </button>
              </div>
            </li>
          ))}
        </ul>

        {docs && docs.length === 0 ? (
          <p className="mt-10 text-center text-sm text-[var(--muted)]">
            No documents yet. Create one to get started.
          </p>
        ) : null}
      </div>
    </div>
  );
}
