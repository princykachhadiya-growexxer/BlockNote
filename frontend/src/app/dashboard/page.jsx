"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { authFetch, clearAccessToken, getAccessToken } from "@/lib/browser-auth";

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
  const [docs, setDocs] = useState(null);
  const [loadError, setLoadError] = useState(null);
  const [creating, setCreating] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editTitle, setEditTitle] = useState("");

  const load = useCallback(async () => {
    setLoadError(null);
    const res = await authFetch("/api/documents");
    if (res.status === 401) {
      clearAccessToken();
      router.replace("/login");
      return;
    }
    if (!res.ok) {
      setLoadError("Could not load documents.");
      return;
    }
    const data = await res.json();
    setDocs(data.documents);
  }, [router]);

  useEffect(() => {
    if (!getAccessToken()) {
      router.replace("/login");
      return;
    }
    void load();
  }, [load, router]);

  async function createDoc() {
    setCreating(true);
    try {
      const res = await authFetch("/api/documents", { method: "POST" });
      if (res.status === 401) {
        clearAccessToken();
        router.replace("/login");
        return;
      }
      if (!res.ok) return;
      await load();
    } finally {
      setCreating(false);
    }
  }

  async function deleteDoc(id) {
    if (!confirm("Delete this document?")) return;
    const res = await authFetch(`/api/documents/${id}`, { method: "DELETE" });
    if (res.status === 401) {
      clearAccessToken();
      router.replace("/login");
      return;
    }
    if (!res.ok) return;
    await load();
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
    if (res.status === 401) {
      clearAccessToken();
      router.replace("/login");
      return;
    }
    await load();
  }

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST", credentials: "include" });
    clearAccessToken();
    router.replace("/login");
    router.refresh();
  }

  if (docs === null && !loadError) {
    return (
      <div className="flex min-h-full flex-1 items-center justify-center bg-zinc-50 text-sm text-zinc-600">
        Loading documents…
      </div>
    );
  }

  return (
    <div className="min-h-full flex-1 bg-[#e5f5ff] px-4 py-10 sm:px-8">
      <div className="mx-auto max-w-3xl">
        <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-zinc-900">Your documents 📄</h1>
            <p className="mt-1 text-sm text-zinc-600">
              Create, rename, or delete documents. Editor comes in later milestones.
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
            <button
              type="button"
              onClick={() => void logout()}
              className="rounded-lg border border-zinc-300 bg-white px-4 py-2 text-sm font-medium text-zinc-800 hover:bg-zinc-50"
            >
              Log out
            </button>
          </div>
        </header>

        {loadError ? <p className="mt-6 text-sm text-red-600">{loadError}</p> : null}

        <ul className="mt-8 space-y-2">
          {(docs ?? []).map((d) => (
            <li
              key={d.id}
              className="flex flex-col gap-3 rounded-xl border border-zinc-200 bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between"
            >
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
                    className="w-full rounded-md border border-zinc-300 bg-white px-2 py-1 text-sm font-medium text-zinc-900 placeholder:text-zinc-400 outline-none ring-zinc-400 focus:ring-2"
                  />
                ) : (
                  <button
                    type="button"
                    onClick={() => startRename(d)}
                    className="block w-full truncate text-left text-sm font-medium text-zinc-900 underline-offset-2 hover:underline"
                    title="Click to rename"
                  >
                    {d.title}
                  </button>
                )}
                <p className="mt-1 text-xs text-zinc-500">Updated {formatUpdated(d.updated_at)}</p>
              </div>
              <div className="flex shrink-0 gap-2">
                <Link
                  href={`/documents/${d.id}`}
                  className="inline-flex items-center justify-center rounded-lg border border-zinc-200 px-3 py-1.5 text-sm font-medium text-zinc-800 hover:bg-zinc-50"
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
          <p className="mt-10 text-center text-sm text-zinc-600">No documents yet. Create one to get started.</p>
        ) : null}
      </div>
    </div>
  );
}
