"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Block from "./Block";
import SaveStatus from "./SaveStatus";
import SharePanel from "./SharePanel";
import {
  fetchBlocks,
  apiFetchDoc,
  apiToggleBlockStar,
  apiCreateBlock,
  apiUpdateBlock,
  apiDeleteBlock,
  apiSplitBlock,
  apiReorderBlocks,
  apiUpdateDocTitle,
} from "@/lib/blocks-api";
import {
  BASE_STEP,
  midpoint,
  buildRenormList,
} from "@/lib/order-index";
import {
  isBlockEmpty,
  mergeBlockContent,
  normalizeTextContent,
} from "@/lib/rich-text";
import { useAuth } from "@/components/providers/AuthProvider";

const NON_TEXT_TYPES = new Set(["divider", "image"]);

export default function BlockEditor({ docId, initialTitle, shareToken }) {
  const router = useRouter();
  const { clearAuthSession } = useAuth();
  const [blocks, setBlocks] = useState([]);
  const [title, setTitle] = useState(initialTitle ?? "Untitled");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [focusedId, setFocusedId] = useState(null);
  const [titleStatus, setTitleStatus] = useState("idle");
  const [blockSaveStatus, setBlockSaveStatus] = useState("idle");
  const [toast, setToast] = useState(null);
  const [dropTarget, setDropTarget] = useState(null);
  const [creatingAfterId, setCreatingAfterId] = useState(null);
  const [togglingStarIds, setTogglingStarIds] = useState([]);

  const blockRefsMap = useRef(new Map());
  const pendingSaves = useRef(new Map());
  const titleSaveRef = useRef(null);
  const titleAbort = useRef(null);
  const dragState = useRef(null);
  const toastTimerRef = useRef(null);
  const handledHashRef = useRef(null);

  const sortedBlocks = useMemo(
    () => [...blocks].sort((a, b) => a.order_index - b.order_index),
    [blocks]
  );

  const editorStatus = useMemo(() => {
    const states = [titleStatus, blockSaveStatus];
    if (states.includes("error")) return "error";
    if (states.includes("saving")) return "saving";
    if (states.includes("pending")) return "pending";
    if (states.includes("saved")) return "saved";
    return "idle";
  }, [titleStatus, blockSaveStatus]);

  useEffect(() => {
    let cancelled = false;
    if (!docId) {
      setError("Document not found or access denied.");
      setLoading(false);
      return () => {
        cancelled = true;
      };
    }

    setLoading(true);
    setError(null);

    Promise.all([fetchBlocks(docId), apiFetchDoc(docId)])
      .then(([loadedBlocks, document]) => {
        if (cancelled) return;
        const next = loadedBlocks
          .map((block) => normalizeLoadedBlock(block))
          .sort((a, b) => a.order_index - b.order_index);
        setBlocks(next);
        setTitle(document.title || "Untitled");
        setFocusedId(next[0]?.id ?? null);
        setLoading(false);
      })
      .catch((err) => {
        if (cancelled) return;
        if (err?.status === 401) {
          clearAuthSession();
          router.replace("/login");
          return;
        }
        if (err?.status === 403 || err?.status === 404 || err?.message?.includes("Not found")) {
          setError("Document not found or access denied.");
        } else {
          setError("Failed to load document.");
        }
        setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [clearAuthSession, docId, router]);

  useEffect(() => {
    if (!focusedId) return;
    const ref = blockRefsMap.current.get(focusedId);
    const el = ref?.current;
    if (el && document.activeElement !== el) {
      el.focus();
    }
  }, [focusedId, blocks]);

  useEffect(() => {
    if (typeof window === "undefined" || !sortedBlocks.length) return;
    const hash = window.location.hash;
    if (!hash.startsWith("#block-")) return;
    if (handledHashRef.current === hash) return;

    const blockId = hash.slice(7);
    const target = document.getElementById(`block-${blockId}`);
    if (!target) return;

    requestAnimationFrame(() => {
      target.scrollIntoView({ block: "center", behavior: "smooth" });
      setFocusedId(blockId);
      handledHashRef.current = hash;
    });
  }, [sortedBlocks]);

  useEffect(() => {
    const pendingSaveMap = pendingSaves.current;
    return () => {
      for (const pending of pendingSaveMap.values()) {
        if (pending.timer) clearTimeout(pending.timer);
        if (pending.controller) pending.controller.abort();
      }
      if (titleSaveRef.current) clearTimeout(titleSaveRef.current);
      if (titleAbort.current) titleAbort.current.abort();
      if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    };
  }, []);

  const registerRef = useCallback((blockId, ref) => {
    if (ref === null) {
      blockRefsMap.current.delete(blockId);
      return;
    }
    blockRefsMap.current.set(blockId, ref);
  }, []);

  function showToast(message) {
    setToast(message);
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    toastTimerRef.current = setTimeout(() => setToast(null), 2200);
  }

  function refreshBlockSaveStatus() {
    const entries = [...pendingSaves.current.values()];
    const hasSaving = entries.some((entry) => entry.controller);
    const hasPending = entries.some((entry) => entry.timer);
    setBlockSaveStatus(hasSaving ? "saving" : hasPending ? "pending" : entries.length ? "pending" : "saved");
  }

  function cancelPendingSave(blockId) {
    const pending = pendingSaves.current.get(blockId);
    if (!pending) return;
    if (pending.timer) clearTimeout(pending.timer);
    if (pending.controller) pending.controller.abort();
    pendingSaves.current.delete(blockId);
    refreshBlockSaveStatus();
  }

  function updateLocalBlock(blockId, updater) {
    setBlocks((prev) =>
      prev.map((block) => (block.id === blockId ? normalizeLoadedBlock(updater(block)) : block))
    );
  }

  async function toggleBlockStar(blockId) {
    if (togglingStarIds.includes(blockId)) return;

    const current = sortedBlocks.find((block) => block.id === blockId);
    if (!current) return;

    setTogglingStarIds((prev) => [...prev, blockId]);
    updateLocalBlock(blockId, (block) => ({ ...block, isStarred: !block.isStarred }));

    try {
      const result = await apiToggleBlockStar(blockId);
      updateLocalBlock(blockId, (block) => ({ ...block, isStarred: result.isStarred }));
    } catch (err) {
      updateLocalBlock(blockId, (block) => ({ ...block, isStarred: current.isStarred }));
      if (err?.status === 401) {
        clearAuthSession();
        router.replace("/login");
      } else {
        showToast("Could not update star");
      }
    } finally {
      setTogglingStarIds((prev) => prev.filter((id) => id !== blockId));
    }
  }

  async function ensureInsertGap(prevIndex, nextIndex, currentBlocks = sortedBlocks) {
    if (
      prevIndex != null &&
      nextIndex != null &&
      Math.abs(nextIndex - prevIndex) < 0.001
    ) {
      const normalized = buildRenormList(currentBlocks);
      await apiReorderBlocks(docId, normalized);
      setBlocks((prev) =>
        prev
          .map((block) => {
            const match = normalized.find((item) => item.id === block.id);
            return match ? { ...block, order_index: match.order_index } : block;
          })
          .sort((a, b) => a.order_index - b.order_index)
      );
      return normalized;
    }

    return null;
  }

  function focusBlockEnd(blockId) {
    const ref = blockRefsMap.current.get(blockId);
    const el = ref?.current;
    if (!el) return;
    el.focus();
    const range = document.createRange();
    const selection = window.getSelection();
    range.selectNodeContents(el);
    range.collapse(false);
    selection?.removeAllRanges();
    selection?.addRange(range);
  }

  function focusBlockStart(blockId) {
    const ref = blockRefsMap.current.get(blockId);
    const el = ref?.current;
    if (!el) return;
    el.focus();
    const range = document.createRange();
    const selection = window.getSelection();
    range.selectNodeContents(el);
    range.collapse(true);
    selection?.removeAllRanges();
    selection?.addRange(range);
  }

  const scheduleBlockSave = useCallback((blockId, fields) => {
    const existing = pendingSaves.current.get(blockId);
    if (existing?.timer) clearTimeout(existing.timer);
    if (existing?.controller) existing.controller.abort();

    const timer = setTimeout(async () => {
      const controller = new AbortController();
      pendingSaves.current.set(blockId, { controller });
      refreshBlockSaveStatus();

      try {
        const updated = await apiUpdateBlock(docId, blockId, fields, controller.signal);
        updateLocalBlock(blockId, () => updated);
      } catch (err) {
        if (err?.name === "AbortError") return;
        console.error("[block save]", err);
        setBlockSaveStatus("error");
        return;
      } finally {
        pendingSaves.current.delete(blockId);
        refreshBlockSaveStatus();
      }
    }, 1000);

    pendingSaves.current.set(blockId, { timer });
    refreshBlockSaveStatus();
  }, [docId]);

  const handleBlockChange = useCallback((blockId, fields) => {
    if (!fields?.content) return;

    setBlocks((prev) =>
      prev.map((block) =>
        block.id === blockId
          ? normalizeLoadedBlock({ ...block, content: fields.content })
          : block
      )
    );

    scheduleBlockSave(blockId, { content: fields.content });
  }, [scheduleBlockSave]);

  function handleTitleChange(e) {
    const nextTitle = e.target.value;
    setTitle(nextTitle);
    setTitleStatus("pending");

    if (titleSaveRef.current) clearTimeout(titleSaveRef.current);
    if (titleAbort.current) titleAbort.current.abort();

    titleSaveRef.current = setTimeout(async () => {
      const controller = new AbortController();
      titleAbort.current = controller;
      setTitleStatus("saving");
      try {
        await apiUpdateDocTitle(docId, nextTitle || "Untitled", controller.signal);
        if (!controller.signal.aborted) setTitleStatus("saved");
      } catch (err) {
        if (err?.name === "AbortError") return;
        setTitleStatus("error");
      }
    }, 1000);
  }

  async function insertBlockBelow(targetId) {
    const creationKey = targetId ?? "__root__";
    if (creatingAfterId === creationKey) return;
    setCreatingAfterId(creationKey);

    try {
      let currentBlocks = [...sortedBlocks];
      if (!currentBlocks.length) {
        const created = await apiCreateBlock(docId, {
          type: "paragraph",
          content: { text: "", html: "" },
          order_index: BASE_STEP,
        });
        const normalized = normalizeLoadedBlock(created);
        setBlocks([normalized]);
        setFocusedId(normalized.id);
        requestAnimationFrame(() => focusBlockStart(normalized.id));
        return;
      }

      const targetIndex = currentBlocks.findIndex((block) => block.id === targetId);
      const anchor = currentBlocks[targetIndex === -1 ? currentBlocks.length - 1 : targetIndex];
      const next = currentBlocks[targetIndex + 1] ?? null;

      const normalizedIndices = await ensureInsertGap(anchor.order_index, next?.order_index ?? null, currentBlocks);
      if (normalizedIndices) {
        currentBlocks = currentBlocks
          .map((block) => {
            const nextValue = normalizedIndices.find((item) => item.id === block.id);
            return nextValue ? { ...block, order_index: nextValue.order_index } : block;
          })
          .sort((a, b) => a.order_index - b.order_index);
      }

      const refreshedAnchor = currentBlocks.find((block) => block.id === anchor.id) ?? anchor;
      const refreshedTargetIndex = currentBlocks.findIndex((block) => block.id === refreshedAnchor.id);
      const refreshedNext = currentBlocks[refreshedTargetIndex + 1] ?? null;
      const orderIndex = midpoint(refreshedAnchor.order_index, refreshedNext?.order_index ?? null);

      const created = await apiCreateBlock(docId, {
        type: "paragraph",
        content: { text: "", html: "" },
        order_index: orderIndex,
      });

      const normalized = normalizeLoadedBlock(created);
      setBlocks((prev) => [...prev, normalized].sort((a, b) => a.order_index - b.order_index));
      setFocusedId(normalized.id);
      requestAnimationFrame(() => focusBlockStart(normalized.id));
    } catch (err) {
      console.error("[add block]", err);
    } finally {
      setCreatingAfterId(null);
    }
  }

  async function handleEnter(blockId, splitPayload) {
    const currentBlocks = [...sortedBlocks];
    const currentIndex = currentBlocks.findIndex((block) => block.id === blockId);
    const block = currentBlocks[currentIndex];
    if (!block) return;

    if (NON_TEXT_TYPES.has(block.type)) {
      await insertBlockBelow(blockId);
      return;
    }

    if (splitPayload.atEnd) {
      await insertBlockBelow(blockId);
      return;
    }

    cancelPendingSave(blockId);

    try {
      let workingBlocks = currentBlocks;
      const next = workingBlocks[currentIndex + 1] ?? null;
      const normalizedIndices = await ensureInsertGap(block.order_index, next?.order_index ?? null, workingBlocks);
      if (normalizedIndices) {
        workingBlocks = workingBlocks
          .map((item) => {
            const nextValue = normalizedIndices.find((value) => value.id === item.id);
            return nextValue ? { ...item, order_index: nextValue.order_index } : item;
          })
          .sort((a, b) => a.order_index - b.order_index);
      }

      const freshBlock = workingBlocks.find((item) => item.id === blockId) ?? block;
      const freshIndex = workingBlocks.findIndex((item) => item.id === blockId);
      const freshNext = workingBlocks[freshIndex + 1] ?? null;
      const rightOrderIndex = midpoint(freshBlock.order_index, freshNext?.order_index ?? null);

      const result = await apiSplitBlock(docId, blockId, {
        leftContent: splitPayload.leftContent,
        rightContent: splitPayload.rightContent,
        rightOrderIndex,
      });

      setBlocks((prev) => {
        const remaining = prev.filter((item) => item.id !== blockId);
        return [
          ...remaining,
          normalizeLoadedBlock(result.left),
          normalizeLoadedBlock(result.right),
        ].sort((a, b) => a.order_index - b.order_index);
      });
      setFocusedId(result.right.id);
      requestAnimationFrame(() => focusBlockStart(result.right.id));
    } catch (err) {
      console.error("[split block]", err);
    }
  }

  async function handleBackspace(blockId) {
    const currentBlocks = [...sortedBlocks];
    const index = currentBlocks.findIndex((block) => block.id === blockId);
    const block = currentBlocks[index];
    if (!block) return;

    if (index === 0) {
      showToast("You are on the first block");
      return;
    }

    const previous = currentBlocks[index - 1];
    if (NON_TEXT_TYPES.has(previous.type)) {
      showToast("Cannot merge with this block type");
      return;
    }

    if (isBlockEmpty(block.content)) {
      cancelPendingSave(blockId);
      try {
        await apiDeleteBlock(docId, blockId);
        setBlocks((prev) => prev.filter((item) => item.id !== blockId));
        setFocusedId(previous.id);
        requestAnimationFrame(() => focusBlockEnd(previous.id));
      } catch (err) {
        console.error("[delete empty block]", err);
      }
      return;
    }

    cancelPendingSave(blockId);
    cancelPendingSave(previous.id);

    const mergedContent = mergeBlockContent(previous.content, block.content);

    try {
      const merged = await apiUpdateBlock(docId, previous.id, {
        content: mergedContent,
      });
      await apiDeleteBlock(docId, blockId);

      setBlocks((prev) =>
        prev
          .filter((item) => item.id !== blockId)
          .map((item) => (item.id === previous.id ? normalizeLoadedBlock(merged) : item))
      );
      setFocusedId(previous.id);
      requestAnimationFrame(() => focusBlockEnd(previous.id));
    } catch (err) {
      console.error("[merge block]", err);
    }
  }

  async function handleConvert(blockId, newType) {
    const current = sortedBlocks.find((block) => block.id === blockId);
    if (!current) return;

    cancelPendingSave(blockId);

    const nextContent = NON_TEXT_TYPES.has(newType)
      ? newType === "image"
        ? { url: "" }
        : {}
      : normalizeTextContent({
          ...current.content,
          text: current.content?.text ?? "",
          html: current.content?.html ?? "",
        });

    updateLocalBlock(blockId, (block) => ({ ...block, type: newType, content: nextContent }));

    try {
      await apiUpdateBlock(docId, blockId, {
        type: newType,
        content: nextContent,
      });
    } catch (err) {
      console.error("[convert block]", err);
    }

    if (!NON_TEXT_TYPES.has(newType)) {
      requestAnimationFrame(() => focusBlockStart(blockId));
    }
  }

  async function persistReorder(nextBlocks, movedId) {
    const movedIndex = nextBlocks.findIndex((block) => block.id === movedId);
    const previous = nextBlocks[movedIndex - 1] ?? null;
    const moved = nextBlocks[movedIndex];
    const next = nextBlocks[movedIndex + 1] ?? null;

    let reordered = [...nextBlocks];
    if (
      previous &&
      next &&
      Math.abs(next.order_index - previous.order_index) < 0.001
    ) {
      const normalized = buildRenormList(reordered);
      reordered = reordered.map((block) => {
        const match = normalized.find((item) => item.id === block.id);
        return match ? { ...block, order_index: match.order_index } : block;
      });
      await apiReorderBlocks(docId, normalized);
      setBlocks(reordered);
      return;
    }

    const newIndex = midpoint(previous?.order_index ?? null, next?.order_index ?? null);
    reordered = reordered.map((block) =>
      block.id === movedId ? { ...block, order_index: newIndex } : block
    );
    const finalBlocks = reordered.sort((a, b) => a.order_index - b.order_index);
    setBlocks(finalBlocks);
    const response = await apiReorderBlocks(docId, [{ id: movedId, order_index: newIndex }]);

    if (response.renormalized && response.blocks?.length) {
      setBlocks((prev) =>
        prev
          .map((block) => {
            const match = response.blocks.find((item) => item.id === block.id);
            return match ? { ...block, order_index: match.order_index } : block;
          })
          .sort((a, b) => a.order_index - b.order_index)
      );
    }
  }

  function handleDragStart(e, blockId) {
    dragState.current = { blockId };
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", blockId);
  }

  function handleDragOver(e, blockId) {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    const rect = e.currentTarget.getBoundingClientRect();
    const position = e.clientY < rect.top + rect.height / 2 ? "before" : "after";
    setDropTarget({ id: blockId, position });
  }

  async function handleDrop(e, targetBlockId) {
    e.preventDefault();
    const activeDropTarget = dropTarget;
    setDropTarget(null);

    const sourceId = dragState.current?.blockId;
    dragState.current = null;
    if (!sourceId || sourceId === targetBlockId) return;

    const currentBlocks = [...sortedBlocks];
    const sourceIndex = currentBlocks.findIndex((block) => block.id === sourceId);
    const targetIndex = currentBlocks.findIndex((block) => block.id === targetBlockId);
    if (sourceIndex === -1 || targetIndex === -1) return;

    const reordered = [...currentBlocks];
    const [moved] = reordered.splice(sourceIndex, 1);
    const dropAfter = activeDropTarget?.id === targetBlockId
      ? activeDropTarget.position === "after"
      : true;
    const rawInsertIndex = dropAfter ? targetIndex + 1 : targetIndex;
    const insertIndex = sourceIndex < rawInsertIndex ? rawInsertIndex - 1 : rawInsertIndex;
    reordered.splice(insertIndex, 0, moved);

    try {
      await persistReorder(reordered, sourceId);
      setFocusedId(sourceId);
    } catch (err) {
      console.error("[reorder]", err);
    }
  }

  function handleDragEnd() {
    dragState.current = null;
    setDropTarget(null);
  }

  if (loading) {
    return (
      <div className="flex flex-1 items-center justify-center text-sm text-zinc-500">
        Loading document…
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-1 items-center justify-center text-sm text-red-500">
        {error}
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col">
      <header className="sticky top-0 z-30 flex items-center gap-3 border-b border-zinc-200 bg-white/90 px-6 py-3 backdrop-blur">
        <a
          href="/dashboard"
          className="mr-2 rounded p-1 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600"
          title="Back to dashboard"
        >
          ←
        </a>
        <div className="flex flex-1 items-center gap-3">
          <SaveStatus status={editorStatus} />
        </div>
        <SharePanel docId={docId} initialToken={shareToken} />
      </header>

      <main className="mx-auto w-full max-w-3xl flex-1 px-6 py-12">
        <input
          type="text"
          value={title}
          onChange={handleTitleChange}
          placeholder="Untitled"
          className="mb-8 w-full bg-transparent text-4xl font-bold text-zinc-900 placeholder:text-zinc-300 outline-none"
        />

        <div className="space-y-1">
          {sortedBlocks.map((block, index) => (
            <div
              key={block.id}
              onDragOver={(e) => handleDragOver(e, block.id)}
              onDrop={(e) => handleDrop(e, block.id)}
              className={`group/row relative flex items-start gap-2 rounded-2xl px-2 py-1 transition ${
                dropTarget?.id === block.id ? "bg-[#D1E9F6]/35" : ""
              }`}
            >
              {dropTarget?.id === block.id && dropTarget.position === "before" ? (
                <div className="absolute inset-x-2 top-0 h-0.5 rounded-full bg-[#2D2D2D]" />
              ) : null}
              {dropTarget?.id === block.id && dropTarget.position === "after" ? (
                <div className="absolute inset-x-2 bottom-0 h-0.5 rounded-full bg-[#2D2D2D]" />
              ) : null}

              <button
                type="button"
                draggable
                onDragStart={(e) => handleDragStart(e, block.id)}
                onDragEnd={handleDragEnd}
                className="mt-0.5 flex shrink-0 cursor-grab items-center rounded-lg p-1 text-zinc-400 opacity-0 transition hover:bg-zinc-100 hover:text-zinc-700 group-hover/row:opacity-100 active:cursor-grabbing"
                aria-label="Drag block"
              >
                <svg className="h-4 w-4" viewBox="0 0 16 16" fill="currentColor">
                  <circle cx="5" cy="4" r="1.2" />
                  <circle cx="5" cy="8" r="1.2" />
                  <circle cx="5" cy="12" r="1.2" />
                  <circle cx="11" cy="4" r="1.2" />
                  <circle cx="11" cy="8" r="1.2" />
                  <circle cx="11" cy="12" r="1.2" />
                </svg>
              </button>

              <button
                type="button"
                onClick={() => void toggleBlockStar(block.id)}
                disabled={togglingStarIds.includes(block.id)}
                className={`mt-0.5 flex shrink-0 items-center rounded-lg p-1 transition ${
                  block.isStarred
                    ? "text-[#1A1A1A] opacity-100"
                    : "text-zinc-400 opacity-0 hover:bg-zinc-100 hover:text-zinc-700 group-hover/row:opacity-100"
                } disabled:opacity-60`}
                aria-label={block.isStarred ? "Remove star from block" : "Star block"}
              >
                <svg className={`h-4 w-4 ${block.isStarred ? "fill-current" : ""}`} viewBox="0 0 20 20" fill={block.isStarred ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1.5">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 0 0 .95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 0 0-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.539 1.118l-2.8-2.034a1 1 0 0 0-1.176 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 0 0-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81H7.03a1 1 0 0 0 .95-.69l1.07-3.292Z" />
                </svg>
              </button>

              <button
                type="button"
                onClick={() => insertBlockBelow(block.id)}
                disabled={creatingAfterId === block.id || creatingAfterId === "__root__"}
                className="mt-0.5 flex shrink-0 items-center rounded-lg p-1 text-zinc-400 opacity-0 transition hover:bg-zinc-100 hover:text-zinc-700 group-hover/row:opacity-100 disabled:opacity-40"
                aria-label="Add block below"
              >
                <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" />
                </svg>
              </button>

              <div className="min-w-0 flex-1">
                <Block
                  block={block}
                  focused={focusedId === block.id}
                  onFocus={() => setFocusedId(block.id)}
                  onChange={handleBlockChange}
                  onEnter={handleEnter}
                  onBackspace={handleBackspace}
                  onConvert={handleConvert}
                  registerRef={registerRef}
                />
              </div>
            </div>
          ))}
        </div>

        <button
          type="button"
          onClick={() => insertBlockBelow(focusedId ?? sortedBlocks[sortedBlocks.length - 1]?.id ?? null)}
          disabled={creatingAfterId != null}
          className="mt-4 flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600 disabled:opacity-50"
        >
          <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
            <path d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" />
          </svg>
          Add block
        </button>
      </main>

      {toast && (
        <div className="pointer-events-none fixed bottom-6 right-6 z-50 rounded-2xl bg-[#2D2D2D] px-4 py-3 text-sm font-medium text-white shadow-xl">
          {toast}
        </div>
      )}
    </div>
  );
}

function normalizeLoadedBlock(block) {
  if (NON_TEXT_TYPES.has(block.type) || block.type === "code") {
    return {
      ...block,
      isStarred: Boolean(block.isStarred),
      content: {
        ...block.content,
        text: block.content?.text ?? "",
        html: block.type === "code" ? "" : block.content?.html ?? "",
      },
    };
  }

  return {
    ...block,
    isStarred: Boolean(block.isStarred),
    content: normalizeTextContent(block.content),
  };
}
