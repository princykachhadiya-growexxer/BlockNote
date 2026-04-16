"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { authFetch } from "@/lib/browser-auth";
import { useAuth } from "@/components/providers/AuthProvider";
import {
  apiDeleteDocument,
  apiFetchDashboardAnalytics,
  apiToggleDocumentStar,
} from "@/lib/blocks-api";

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

const statCards = [
  {
    key: "documents",
    label: "Active documents",
    tone: "bg-[#FFFFFF]/90",
  },
  {
    key: "deletedDocuments",
    label: "In trash",
    tone: "bg-[#F9D8E6]/70",
  },
  {
    key: "blocks",
    label: "Total blocks",
    tone: "bg-[#E1F0D7]/80",
  },
];

export default function DashboardPage() {
  const router = useRouter();
  const { clearAuthSession } = useAuth();
  const [analytics, setAnalytics] = useState(null);
  const [loadError, setLoadError] = useState(null);
  const [creating, setCreating] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editTitle, setEditTitle] = useState("");
  const [pendingStarIds, setPendingStarIds] = useState([]);
  const [pendingTrashIds, setPendingTrashIds] = useState([]);

  function handleUnauthorized() {
    clearAuthSession();
    router.replace("/login");
  }

  const load = useCallback(async () => {
    setLoadError(null);
    try {
      const result = await apiFetchDashboardAnalytics();
      setAnalytics(result);
    } catch (err) {
      if (err?.status === 401) {
        handleUnauthorized();
        return;
      }
      setLoadError("Could not load your workspace data.");
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  async function createDoc() {
    setCreating(true);
    try {
      const res = await authFetch("/api/documents", { method: "POST" });
      if (res.status === 401) {
        handleUnauthorized();
        return;
      }
      if (!res.ok) return;
      const data = await res.json();
      const createdId = data?.document?.id;
      if (createdId) {
        router.push(`/documents/${createdId}`);
        return;
      }
      await load();
    } finally {
      setCreating(false);
    }
  }

  async function moveToTrash(id) {
    if (pendingTrashIds.includes(id)) return;
    if (!confirm("Move this document to Trash?")) return;

    setPendingTrashIds((prev) => [...prev, id]);
    try {
      await apiDeleteDocument(id);
      await load();
    } catch (err) {
      if (err?.status === 401) handleUnauthorized();
    } finally {
      setPendingTrashIds((prev) => prev.filter((docId) => docId !== id));
    }
  }

  async function toggleStar(id) {
    if (pendingStarIds.includes(id)) return;

    const previous = analytics;
    setPendingStarIds((prev) => [...prev, id]);
    setAnalytics((current) =>
      current == null
        ? current
        : {
            ...current,
            documents: current.documents.map((doc) =>
              doc.id === id ? { ...doc, isStarred: !doc.isStarred } : doc
            ),
          }
    );

    try {
      const result = await apiToggleDocumentStar(id);
      setAnalytics((current) =>
        current == null
          ? current
          : {
              ...current,
              documents: current.documents.map((doc) =>
                doc.id === id ? { ...doc, isStarred: result.isStarred } : doc
              ),
            }
      );
    } catch (err) {
      setAnalytics(previous);
      if (err?.status === 401) handleUnauthorized();
    } finally {
      setPendingStarIds((prev) => prev.filter((docId) => docId !== id));
    }
  }

  function startRename(doc) {
    setEditingId(doc.id);
    setEditTitle(doc.title);
  }

  async function commitRename(id) {
    const title = editTitle.trim();
    setEditingId(null);

    if (!title) {
      await load();
      return;
    }

    const res = await authFetch(`/api/documents/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title }),
    });

    if (res.status === 401) {
      handleUnauthorized();
      return;
    }

    await load();
  }

  if (analytics == null && !loadError) {
    return (
      <div className="flex min-h-full flex-1 items-center justify-center text-sm text-[var(--muted)]">
        Loading workspace…
      </div>
    );
  }

  const documents = analytics?.documents ?? [];

  return (
    <div className="min-h-full flex-1 px-4 py-8 sm:px-8">
      <div className="mx-auto max-w-6xl">
        <header className="rounded-[2rem] border border-[var(--edge)] bg-[linear-gradient(135deg,rgba(183,188,232,0.88),rgba(209,233,246,0.74),rgba(255,255,255,0.94))] px-6 py-7 shadow-[0_28px_80px_rgba(74,83,120,0.14)]">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#1A1A1A]/55">
                Workspace Overview
              </p>
              <h1 className="mt-3 text-3xl font-semibold text-[#1A1A1A] sm:text-4xl">
                Documents, activity, and everything worth revisiting
              </h1>
              <p className="mt-3 max-w-2xl text-sm leading-7 text-[#1A1A1A]/68">
                Keep track of your writing space, see how often pages get shared, and move clutter
                into Trash without losing it.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => void createDoc()}
                disabled={creating}
                className="rounded-2xl bg-[#2D2D2D] px-5 py-3 text-sm font-semibold text-white shadow-[0_18px_40px_rgba(45,45,45,0.18)] transition hover:-translate-y-0.5 hover:bg-black disabled:translate-y-0 disabled:opacity-60"
              >
                {creating ? "Creating…" : "+ New document"}
              </button>
              <Link
                href="/trash"
                className="rounded-2xl border border-[#1A1A1A]/10 bg-white/72 px-5 py-3 text-sm font-semibold text-[#1A1A1A] transition hover:-translate-y-0.5 hover:bg-white"
              >
                Open Trash
              </Link>
            </div>
          </div>
        </header>

        <section className="mt-6 grid gap-4 md:grid-cols-3">
          {statCards.map((card) => (
            <article
              key={card.key}
              className={`rounded-[1.6rem] border border-[var(--edge)] ${card.tone} p-5 shadow-[0_18px_50px_rgba(74,83,120,0.08)]`}
            >
              <p className="text-sm font-medium text-[#1A1A1A]/62">{card.label}</p>
              <p className="mt-3 text-3xl font-semibold text-[#1A1A1A]">
                {analytics?.totals?.[card.key] ?? 0}
              </p>
            </article>
          ))}
        </section>

        {loadError ? (
          <p className="mt-6 text-sm text-red-600">{loadError}</p>
        ) : null}

        <section className="mt-8">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--muted)]">
                Active Documents
              </p>
              <h2 className="mt-2 text-2xl font-semibold text-[var(--foreground)]">
                Manage your workspace
              </h2>
            </div>
          </div>

          {documents.length === 0 ? (
            <div className="mt-6 rounded-[1.75rem] border border-[var(--edge)] bg-[var(--surface)] p-10 text-center shadow-[0_18px_50px_rgba(74,83,120,0.08)]">
              <p className="text-base font-medium text-[var(--foreground)]">No documents yet.</p>
              <p className="mt-2 text-sm text-[var(--muted)]">
                Create your first page to start building your block workspace.
              </p>
            </div>
          ) : (
            <div className="mt-6 grid gap-4 lg:grid-cols-2">
              {documents.map((doc) => (
                <article
                  key={doc.id}
                  className="rounded-[1.7rem] border border-[var(--edge)] bg-[var(--surface)] p-5 shadow-[0_20px_60px_rgba(74,83,120,0.08)]"
                >
                  <div className="flex items-start gap-3">
                    <button
                      type="button"
                      onClick={() => void toggleStar(doc.id)}
                      disabled={pendingStarIds.includes(doc.id)}
                      className={`mt-1 inline-flex rounded-2xl p-2 transition ${
                        doc.isStarred
                          ? "bg-[#B7BCE8] text-[#1A1A1A]"
                          : "bg-[#F6F8FD] text-[var(--muted)] hover:bg-[#D1E9F6] hover:text-[#1A1A1A]"
                      } disabled:opacity-60`}
                      aria-label={doc.isStarred ? "Remove star from document" : "Star document"}
                    >
                      <svg className="h-4 w-4" viewBox="0 0 20 20" fill={doc.isStarred ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1.5">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 0 0 .95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 0 0-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.539 1.118l-2.8-2.034a1 1 0 0 0-1.176 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 0 0-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81H7.03a1 1 0 0 0 .95-.69l1.07-3.292Z" />
                      </svg>
                    </button>

                    <div className="min-w-0 flex-1">
                      {editingId === doc.id ? (
                        <input
                          autoFocus
                          value={editTitle}
                          onChange={(e) => setEditTitle(e.target.value)}
                          onBlur={() => void commitRename(doc.id)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") e.target.blur();
                            if (e.key === "Escape") {
                              setEditingId(null);
                              void load();
                            }
                          }}
                          className="w-full rounded-2xl border border-[var(--edge)] bg-white px-3 py-2 text-base font-semibold text-[var(--foreground)] outline-none ring-[#B7BCE8] focus:ring-2"
                        />
                      ) : (
                        <button
                          type="button"
                          onClick={() => startRename(doc)}
                          className="block w-full truncate text-left text-lg font-semibold text-[var(--foreground)]"
                          title="Click to rename"
                        >
                          {doc.title}
                        </button>
                      )}

                      <div className="mt-4 grid gap-3 sm:grid-cols-3">
                        <div className="rounded-2xl bg-[#F6F8FD] px-3 py-3">
                          <p className="text-[11px] uppercase tracking-[0.2em] text-[var(--muted)]">
                            Shares
                          </p>
                          <p className="mt-1 text-lg font-semibold text-[#1A1A1A]">{doc.shareCount}</p>
                        </div>
                        <div className="rounded-2xl bg-[#D1E9F6]/60 px-3 py-3">
                          <p className="text-[11px] uppercase tracking-[0.2em] text-[var(--muted)]">
                            Blocks
                          </p>
                          <p className="mt-1 text-lg font-semibold text-[#1A1A1A]">{doc.blockCount}</p>
                        </div>
                        <div className="rounded-2xl bg-[#E1F0D7]/70 px-3 py-3">
                          <p className="text-[11px] uppercase tracking-[0.2em] text-[var(--muted)]">
                            Starred
                          </p>
                          <p className="mt-1 text-lg font-semibold text-[#1A1A1A]">
                            {doc.isStarred ? "Yes" : "No"}
                          </p>
                        </div>
                      </div>

                      <p className="mt-4 text-xs text-[var(--muted)]">
                        Updated {formatUpdated(doc.updated_at)}
                      </p>
                    </div>
                  </div>

                  <div className="mt-5 flex flex-wrap gap-2">
                    <Link
                      href={`/documents/${doc.id}`}
                      className="inline-flex items-center justify-center rounded-2xl bg-[#2D2D2D] px-4 py-2 text-sm font-semibold text-white transition hover:bg-black"
                    >
                      Open
                    </Link>
                    <button
                      type="button"
                      onClick={() => void moveToTrash(doc.id)}
                      disabled={pendingTrashIds.includes(doc.id)}
                      className="inline-flex items-center justify-center rounded-2xl border border-[#F9D8E6] bg-[#F9D8E6]/80 px-4 py-2 text-sm font-semibold text-[#1A1A1A] transition hover:bg-[#F9D8E6] disabled:opacity-60"
                    >
                      Move to Trash
                    </button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
