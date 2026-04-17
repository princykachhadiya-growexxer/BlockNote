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
import {
  useDocumentFilters,
  DATE_RANGES,
  DATE_RANGE_LABELS,
} from "@/hooks/useDocumentFilters";

// ─── Helpers ──────────────────────────────────────────────────────────────────

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

/** Map internal block type keys to human-readable labels */
const BLOCK_TYPE_LABELS = {
  text: "Text",
  paragraph: "Text",
  heading: "Heading",
  code: "Code",
  image: "Image",
  todo: "To-do",
};

function blockTypeLabel(type) {
  return BLOCK_TYPE_LABELS[type] ?? type.charAt(0).toUpperCase() + type.slice(1);
}

// ─── Stat cards config (unchanged from original) ─────────────────────────────

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

// ─── Sub-components ───────────────────────────────────────────────────────────

/**
 * FilterBar — search, date range, block type multi-select, pinned toggle.
 * Designed to match the existing design system exactly.
 */
function FilterBar({
  searchRaw,
  onSearchChange,
  dateRange,
  onDateRangeChange,
  selectedBlockTypes,
  onToggleBlockType,
  availableBlockTypes,
  showPinnedOnly,
  onTogglePinnedOnly,
  activeFilterCount,
  onReset,
}) {
  const [blockTypeOpen, setBlockTypeOpen] = useState(false);

  return (
    <div className="mt-5 flex flex-wrap items-center gap-2">
      {/* ── Search ── */}
      <div className="relative flex-1 min-w-[200px] max-w-xs">
        <svg
          className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--muted)]"
          viewBox="0 0 20 20"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.6"
        >
          <circle cx="8.5" cy="8.5" r="5.5" />
          <path d="m13 13 3 3" strokeLinecap="round" />
        </svg>
        <input
          type="text"
          placeholder="Search documents…"
          value={searchRaw}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full rounded-2xl border border-[var(--edge)] bg-[var(--surface)] py-2 pl-9 pr-3 text-sm text-[var(--foreground)] placeholder:text-[var(--muted)] outline-none ring-[#B7BCE8] focus:ring-2 transition"
        />
      </div>

      {/* ── Date range ── */}
      <select
        value={dateRange}
        onChange={(e) => onDateRangeChange(e.target.value)}
        className="rounded-2xl border border-[var(--edge)] bg-[var(--surface)] px-3 py-2 text-sm text-[var(--foreground)] outline-none ring-[#B7BCE8] focus:ring-2 transition cursor-pointer"
        aria-label="Filter by date"
      >
        {Object.entries(DATE_RANGE_LABELS).map(([value, label]) => (
          <option key={value} value={value}>
            {label}
          </option>
        ))}
      </select>

      {/* ── Block type multi-select ── */}
      {availableBlockTypes.length > 0 && (
        <div className="relative">
          <button
            type="button"
            onClick={() => setBlockTypeOpen((o) => !o)}
            className={`flex items-center gap-1.5 rounded-2xl border px-3 py-2 text-sm font-medium transition ${
              selectedBlockTypes.size > 0
                ? "border-[#B7BCE8] bg-[#B7BCE8]/30 text-[#1A1A1A]"
                : "border-[var(--edge)] bg-[var(--surface)] text-[var(--foreground)]"
            }`}
            aria-haspopup="listbox"
            aria-expanded={blockTypeOpen}
          >
            {/* Stack icon */}
            <svg className="h-4 w-4" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6">
              <path d="M2 5h16M2 10h16M2 15h16" strokeLinecap="round" />
            </svg>
            Block type
            {selectedBlockTypes.size > 0 && (
              <span className="ml-0.5 rounded-full bg-[#2D2D2D] px-1.5 py-0.5 text-[10px] font-semibold text-white leading-none">
                {selectedBlockTypes.size}
              </span>
            )}
            <svg
              className={`h-3 w-3 transition-transform ${blockTypeOpen ? "rotate-180" : ""}`}
              viewBox="0 0 12 12"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M2 4l4 4 4-4" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>

          {/* Dropdown */}
          {blockTypeOpen && (
            <>
              {/* Click-away overlay */}
              <div
                className="fixed inset-0 z-10"
                onClick={() => setBlockTypeOpen(false)}
                aria-hidden="true"
              />
              <div
                role="listbox"
                aria-multiselectable="true"
                className="absolute left-0 top-full z-20 mt-1 min-w-[160px] rounded-2xl border border-[var(--edge)] bg-[var(--surface)] p-2 shadow-[0_18px_50px_rgba(74,83,120,0.12)]"
              >
                {availableBlockTypes.map((type) => {
                  const selected = selectedBlockTypes.has(type);
                  return (
                    <button
                      key={type}
                      type="button"
                      role="option"
                      aria-selected={selected}
                      onClick={() => onToggleBlockType(type)}
                      className={`flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm transition ${
                        selected
                          ? "bg-[#B7BCE8]/40 font-semibold text-[#1A1A1A]"
                          : "text-[var(--foreground)] hover:bg-[#F6F8FD]"
                      }`}
                    >
                      {/* Checkmark */}
                      <span className={`h-4 w-4 shrink-0 rounded-md border flex items-center justify-center transition ${selected ? "border-[#2D2D2D] bg-[#2D2D2D]" : "border-[var(--muted)]"}`}>
                        {selected && (
                          <svg className="h-2.5 w-2.5 text-white" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M1.5 5l3 3 4-4" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        )}
                      </span>
                      {blockTypeLabel(type)}
                    </button>
                  );
                })}
                {/* Clear selection */}
                {selectedBlockTypes.size > 0 && (
                  <button
                    type="button"
                    onClick={() => {
                      // Clear all block type selections by toggling each off
                      selectedBlockTypes.forEach(onToggleBlockType);
                    }}
                    className="mt-1 w-full rounded-xl px-3 py-1.5 text-xs text-[var(--muted)] transition hover:bg-[#F9D8E6]/60 hover:text-[#1A1A1A]"
                  >
                    Clear selection
                  </button>
                )}
              </div>
            </>
          )}
        </div>
      )}

      {/* ── Pinned toggle ── */}
      <button
        type="button"
        onClick={() => onTogglePinnedOnly(!showPinnedOnly)}
        className={`flex items-center gap-1.5 rounded-2xl border px-3 py-2 text-sm font-medium transition ${
          showPinnedOnly
            ? "border-[#B7BCE8] bg-[#B7BCE8]/30 text-[#1A1A1A]"
            : "border-[var(--edge)] bg-[var(--surface)] text-[var(--foreground)]"
        }`}
        aria-pressed={showPinnedOnly}
      >
        <svg className="h-4 w-4" viewBox="0 0 20 20" fill={showPinnedOnly ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1.6">
          <path d="M10 2.5L12.47 7.5H17.5L13.5 10.9L15 16L10 13L5 16L6.5 10.9L2.5 7.5H7.53L10 2.5Z" strokeLinejoin="round" />
        </svg>
        Pinned
      </button>

      {/* ── Active filter count / clear ── */}
      {activeFilterCount > 0 && (
        <button
          type="button"
          onClick={onReset}
          className="flex items-center gap-1 rounded-2xl border border-[#F9D8E6] bg-[#F9D8E6]/60 px-3 py-2 text-sm font-medium text-[#1A1A1A] transition hover:bg-[#F9D8E6]"
        >
          <svg className="h-3.5 w-3.5" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M1 1l12 12M13 1L1 13" strokeLinecap="round" />
          </svg>
          Clear {activeFilterCount} filter{activeFilterCount !== 1 ? "s" : ""}
        </button>
      )}
    </div>
  );
}

// ─── Page component ───────────────────────────────────────────────────────────

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

  // ── Filters (all logic isolated in hook) ─────────────────────────────────
  const {
    searchRaw,
    dateRange,
    selectedBlockTypes,
    showPinnedOnly,
    pinnedIds,
    handleSearchChange,
    setDateRange,
    toggleBlockType,
    togglePin,
    setShowPinnedOnly,
    filteredDocuments,
    availableBlockTypes,
    activeFilterCount,
    resetFilters,
  } = useDocumentFilters(analytics?.documents ?? []);

  // ── Auth / load helpers ───────────────────────────────────────────────────

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

  // ── Document actions (unchanged from original) ────────────────────────────

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

  // ── Loading state (unchanged) ─────────────────────────────────────────────

  if (analytics == null && !loadError) {
    return (
      <div className="flex min-h-full flex-1 items-center justify-center text-sm text-[var(--muted)]">
        Loading workspace…
      </div>
    );
  }

  const allDocuments = analytics?.documents ?? [];

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-full flex-1 px-4 py-8 sm:px-8">
      <div className="mx-auto max-w-6xl">

        {/* ── Header (unchanged) ── */}
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

        {/* ── Stat cards (unchanged) ── */}
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

        {/* ── Documents section ── */}
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

          {/* ── Filter bar (new) ── */}
          {allDocuments.length > 0 && (
            <FilterBar
              searchRaw={searchRaw}
              onSearchChange={handleSearchChange}
              dateRange={dateRange}
              onDateRangeChange={setDateRange}
              selectedBlockTypes={selectedBlockTypes}
              onToggleBlockType={toggleBlockType}
              availableBlockTypes={availableBlockTypes}
              showPinnedOnly={showPinnedOnly}
              onTogglePinnedOnly={setShowPinnedOnly}
              activeFilterCount={activeFilterCount}
              onReset={resetFilters}
            />
          )}

          {/* ── Empty state ── */}
          {allDocuments.length === 0 ? (
            <div className="mt-6 rounded-[1.75rem] border border-[var(--edge)] bg-[var(--surface)] p-10 text-center shadow-[0_18px_50px_rgba(74,83,120,0.08)]">
              <p className="text-base font-medium text-[var(--foreground)]">No documents yet.</p>
              <p className="mt-2 text-sm text-[var(--muted)]">
                Create your first page to start building your block workspace.
              </p>
            </div>
          ) : filteredDocuments.length === 0 ? (
            /* No results after filtering */
            <div className="mt-6 rounded-[1.75rem] border border-[var(--edge)] bg-[var(--surface)] p-10 text-center shadow-[0_18px_50px_rgba(74,83,120,0.08)]">
              <p className="text-base font-medium text-[var(--foreground)]">No documents match your filters.</p>
              <p className="mt-2 text-sm text-[var(--muted)]">
                Try adjusting your search or filter criteria.
              </p>
              <button
                type="button"
                onClick={resetFilters}
                className="mt-4 rounded-2xl border border-[var(--edge)] bg-[var(--surface-muted)] px-4 py-2 text-sm font-semibold text-[var(--foreground)] transition hover:bg-[#D1E9F6]/60"
              >
                Clear all filters
              </button>
            </div>
          ) : (
            /* Document grid */
            <div className="mt-6 grid gap-4 lg:grid-cols-2">
              {filteredDocuments.map((doc) => {
                const isPinned = pinnedIds.has(doc.id);
                return (
                  <article
                    key={doc.id}
                    className="rounded-[1.7rem] border border-[var(--edge)] bg-[var(--surface)] p-5 shadow-[0_20px_60px_rgba(74,83,120,0.08)]"
                  >
                    <div className="flex items-start gap-3">
                      {/* ── Star button (unchanged) ── */}
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
                        {/* ── Title / rename (unchanged) ── */}
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
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => startRename(doc)}
                              className="block min-w-0 flex-1 truncate text-left text-lg font-semibold text-[var(--foreground)]"
                              title="Click to rename"
                            >
                              {doc.title}
                            </button>
                            {/* ── Pin indicator badge ── */}
                            {isPinned && (
                              <span className="shrink-0 rounded-xl bg-[#B7BCE8]/40 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-[#1A1A1A]/70">
                                Pinned
                              </span>
                            )}
                          </div>
                        )}

                        {/* ── Block type tags (if API returns them) ── */}
                        {doc.blockTypes?.length > 0 && (
                          <div className="mt-2 flex flex-wrap gap-1">
                            {[...new Set(doc.blockTypes)].map((type) => (
                              <span
                                key={type}
                                className="rounded-lg bg-[#F6F8FD] px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-[var(--muted)]"
                              >
                                {blockTypeLabel(type)}
                              </span>
                            ))}
                          </div>
                        )}

                        {/* ── Stats grid (unchanged layout) ── */}
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

                    {/* ── Actions (pin added, rest unchanged) ── */}
                    <div className="mt-5 flex flex-wrap gap-2">
                      <Link
                        href={`/documents/${doc.id}`}
                        className="inline-flex items-center justify-center rounded-2xl bg-[#2D2D2D] px-4 py-2 text-sm font-semibold text-white transition hover:bg-black"
                      >
                        Open
                      </Link>

                      {/* ── Pin / Unpin button (new) ── */}
                      <button
                        type="button"
                        onClick={() => togglePin(doc.id)}
                        className={`inline-flex items-center justify-center gap-1.5 rounded-2xl border px-4 py-2 text-sm font-semibold transition ${
                          isPinned
                            ? "border-[#B7BCE8] bg-[#B7BCE8]/30 text-[#1A1A1A] hover:bg-[#B7BCE8]/50"
                            : "border-[var(--edge)] bg-[#F6F8FD] text-[var(--foreground)] hover:bg-[#D1E9F6]/60"
                        }`}
                        aria-label={isPinned ? "Unpin document" : "Pin document"}
                        aria-pressed={isPinned}
                      >
                        <svg className="h-3.5 w-3.5" viewBox="0 0 20 20" fill={isPinned ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1.6">
                          <path d="M10 2.5L12.47 7.5H17.5L13.5 10.9L15 16L10 13L5 16L6.5 10.9L2.5 7.5H7.53L10 2.5Z" strokeLinejoin="round" />
                        </svg>
                        {isPinned ? "Unpin" : "Pin"}
                      </button>

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
                );
              })}
            </div>
          )}

          {/* ── Results summary when filters are active ── */}
          {activeFilterCount > 0 && allDocuments.length > 0 && (
            <p className="mt-4 text-xs text-[var(--muted)]">
              Showing {filteredDocuments.length} of {allDocuments.length} document
              {allDocuments.length !== 1 ? "s" : ""}
            </p>
          )}
        </section>
      </div>
    </div>
  );
}
