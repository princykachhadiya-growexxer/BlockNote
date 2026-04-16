"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/providers/AuthProvider";
import {
  apiFetchDocuments,
  apiToggleBlockStar,
  apiToggleDocumentStar,
  fetchUserBlocks,
} from "@/lib/blocks-api";

function getBlockPreview(block) {
  const text = block.content?.text?.trim() || block.content?.url?.trim() || `${block.type} block`;
  return text.length > 120 ? `${text.slice(0, 120)}…` : text;
}

export default function StarredPage() {
  const router = useRouter();
  const { clearAuthSession, initialized, isAuthenticated } = useAuth();
  const [docs, setDocs] = useState([]);
  const [blocks, setBlocks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pendingDocIds, setPendingDocIds] = useState([]);
  const [pendingBlockIds, setPendingBlockIds] = useState([]);

  const load = useCallback(async () => {
    setError(null);
    try {
      const [documents, starredBlocks] = await Promise.all([
        apiFetchDocuments({ starred: true }),
        fetchUserBlocks({ starred: true }),
      ]);
      setDocs(documents);
      setBlocks(starredBlocks);
      setLoading(false);
    } catch (err) {
      if (err?.status === 401) {
        clearAuthSession();
        router.replace("/login");
      } else {
        setError("Could not load starred items.");
      }
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

  async function removeDocumentStar(id) {
    if (pendingDocIds.includes(id)) return;
    setPendingDocIds((prev) => [...prev, id]);
    const previous = docs;
    setDocs((prev) => prev.filter((doc) => doc.id !== id));

    try {
      await apiToggleDocumentStar(id);
    } catch {
      setDocs(previous);
    } finally {
      setPendingDocIds((prev) => prev.filter((docId) => docId !== id));
    }
  }

  async function removeBlockStar(id) {
    if (pendingBlockIds.includes(id)) return;
    setPendingBlockIds((prev) => [...prev, id]);
    const previous = blocks;
    setBlocks((prev) => prev.filter((block) => block.id !== id));

    try {
      await apiToggleBlockStar(id);
    } catch {
      setBlocks(previous);
    } finally {
      setPendingBlockIds((prev) => prev.filter((blockId) => blockId !== id));
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-full flex-1 items-center justify-center text-sm text-[var(--muted)]">
        Loading starred items…
      </div>
    );
  }

  return (
    <div className="min-h-full flex-1 px-4 py-8 sm:px-8">
      <div className="mx-auto max-w-6xl">
        <header className="rounded-[2rem] border border-[var(--edge)] bg-[linear-gradient(135deg,rgba(255,255,255,0.94),rgba(183,188,232,0.74),rgba(249,216,230,0.78))] px-6 py-6 shadow-[0_24px_70px_rgba(74,83,120,0.08)] backdrop-blur">
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[var(--muted)]">Starred Workspace</p>
          <h1 className="mt-3 text-3xl font-semibold text-[var(--foreground)]">Documents and blocks you pinned on purpose</h1>
          <p className="mt-2 max-w-2xl text-sm leading-7 text-[var(--muted)]">
            Jump back into important pages or directly to the exact block that mattered.
          </p>
        </header>

        {error ? <p className="mt-6 text-sm text-red-600">{error}</p> : null}

        <section className="mt-8 grid gap-4 lg:grid-cols-2">
          <article className="rounded-[1.75rem] border border-[var(--edge)] bg-[var(--surface)] p-6 shadow-[0_18px_50px_rgba(74,83,120,0.08)]">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--muted)]">
                  Documents
                </p>
                <h2 className="mt-2 text-2xl font-semibold text-[var(--foreground)]">
                  {docs.length} starred document{docs.length === 1 ? "" : "s"}
                </h2>
              </div>
            </div>

            {docs.length === 0 ? (
              <p className="mt-6 text-sm text-[var(--muted)]">No starred documents yet.</p>
            ) : (
              <ul className="mt-6 space-y-3">
                {docs.map((doc) => (
                  <li key={doc.id} className="rounded-2xl bg-[#F6F8FD] p-4">
                    <p className="text-base font-semibold text-[var(--foreground)]">{doc.title}</p>
                    <div className="mt-4 flex gap-2">
                      <Link
                        href={`/documents/${doc.id}`}
                        className="inline-flex rounded-2xl bg-[#2D2D2D] px-4 py-2 text-sm font-semibold text-white transition hover:bg-black"
                      >
                        Open
                      </Link>
                      <button
                        type="button"
                        onClick={() => void removeDocumentStar(doc.id)}
                        disabled={pendingDocIds.includes(doc.id)}
                        className="inline-flex rounded-2xl border border-[#B7BCE8] bg-[#B7BCE8]/65 px-4 py-2 text-sm font-semibold text-[#1A1A1A] transition hover:bg-[#B7BCE8] disabled:opacity-60"
                      >
                        Remove star
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </article>

          <article className="rounded-[1.75rem] border border-[var(--edge)] bg-[var(--surface)] p-6 shadow-[0_18px_50px_rgba(74,83,120,0.08)]">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--muted)]">
                Blocks
              </p>
              <h2 className="mt-2 text-2xl font-semibold text-[var(--foreground)]">
                {blocks.length} starred block{blocks.length === 1 ? "" : "s"}
              </h2>
            </div>

            {blocks.length === 0 ? (
              <p className="mt-6 text-sm text-[var(--muted)]">No starred blocks yet.</p>
            ) : (
              <ul className="mt-6 space-y-3">
                {blocks.map((block) => (
                  <li key={block.id} className="rounded-2xl bg-[#D1E9F6]/45 p-4">
                    <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">
                      {block.document?.title || "Untitled document"}
                    </p>
                    <p className="mt-2 text-sm leading-6 text-[var(--foreground)]">
                      {getBlockPreview(block)}
                    </p>
                    <div className="mt-4 flex gap-2">
                      <Link
                        href={`/documents/${block.document_id}#block-${block.id}`}
                        className="inline-flex rounded-2xl bg-[#2D2D2D] px-4 py-2 text-sm font-semibold text-white transition hover:bg-black"
                      >
                        Open in document
                      </Link>
                      <button
                        type="button"
                        onClick={() => void removeBlockStar(block.id)}
                        disabled={pendingBlockIds.includes(block.id)}
                        className="inline-flex rounded-2xl border border-[#B7BCE8] bg-[#B7BCE8]/65 px-4 py-2 text-sm font-semibold text-[#1A1A1A] transition hover:bg-[#B7BCE8] disabled:opacity-60"
                      >
                        Remove star
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </article>
        </section>
      </div>
    </div>
  );
}
