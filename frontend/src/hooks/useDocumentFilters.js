import { useCallback, useMemo, useState, useEffect, useRef } from "react";

// ─── Constants ────────────────────────────────────────────────────────────────

export const DATE_RANGES = {
  ALL: "all",
  TODAY: "today",
  LAST_7: "last7",
  LAST_30: "last30",
};

export const DATE_RANGE_LABELS = {
  [DATE_RANGES.ALL]: "Any date",
  [DATE_RANGES.TODAY]: "Today",
  [DATE_RANGES.LAST_7]: "Last 7 days",
  [DATE_RANGES.LAST_30]: "Last 30 days",
};

/** Block types the app supports. Extend here if new types are added. */
export const KNOWN_BLOCK_TYPES = ["text", "paragraph", "heading", "code", "image", "todo"];

// ─── Pin persistence (localStorage) ──────────────────────────────────────────

const PIN_STORAGE_KEY = "docspace:pinnedDocIds";

function loadPinnedIds() {
  try {
    const raw = localStorage.getItem(PIN_STORAGE_KEY);
    return raw ? new Set(JSON.parse(raw)) : new Set();
  } catch {
    return new Set();
  }
}

function savePinnedIds(set) {
  try {
    localStorage.setItem(PIN_STORAGE_KEY, JSON.stringify([...set]));
  } catch {
    // localStorage may be unavailable (SSR, private mode quota)
  }
}

// ─── Date helpers ─────────────────────────────────────────────────────────────

function startOfDay(date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

function isWithinRange(dateStr, range) {
  if (range === DATE_RANGES.ALL) return true;
  const date = new Date(dateStr);
  const now = new Date();
  const today = startOfDay(now);

  if (range === DATE_RANGES.TODAY) {
    return date >= today;
  }
  if (range === DATE_RANGES.LAST_7) {
    const cutoff = new Date(today);
    cutoff.setDate(cutoff.getDate() - 7);
    return date >= cutoff;
  }
  if (range === DATE_RANGES.LAST_30) {
    const cutoff = new Date(today);
    cutoff.setDate(cutoff.getDate() - 30);
    return date >= cutoff;
  }
  return true;
}

// ─── Main hook ────────────────────────────────────────────────────────────────

/**
 * useDocumentFilters
 *
 * Encapsulates all filter state + logic.
 * Returns filter state, setters, computed filtered list, and pin utilities.
 *
 * @param {Array} documents - Raw documents array from analytics API
 */
export function useDocumentFilters(documents) {
  // ── Filter state ──────────────────────────────────────────────────────────
  const [searchRaw, setSearchRaw] = useState("");
  const [searchDebounced, setSearchDebounced] = useState("");
  const [dateRange, setDateRange] = useState(DATE_RANGES.ALL);
  // Multi-select block type filter: Set of selected types
  const [selectedBlockTypes, setSelectedBlockTypes] = useState(new Set());
  const [showPinnedOnly, setShowPinnedOnly] = useState(false);

  // ── Pin state (localStorage-backed) ──────────────────────────────────────
  const [pinnedIds, setPinnedIdsRaw] = useState(() => new Set());

  // Hydrate pins from localStorage after mount (avoids SSR mismatch)
  useEffect(() => {
    setPinnedIdsRaw(loadPinnedIds());
  }, []);

  const setPinnedIds = useCallback((updater) => {
    setPinnedIdsRaw((prev) => {
      const next = typeof updater === "function" ? updater(prev) : updater;
      savePinnedIds(next);
      return next;
    });
  }, []);

  // ── Debounce search input (300ms) ─────────────────────────────────────────
  const debounceRef = useRef(null);
  const handleSearchChange = useCallback((value) => {
    setSearchRaw(value);
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setSearchDebounced(value.trim().toLowerCase());
    }, 300);
  }, []);

  // ── Block type multi-select helpers ───────────────────────────────────────
  const toggleBlockType = useCallback((type) => {
    setSelectedBlockTypes((prev) => {
      const next = new Set(prev);
      if (next.has(type)) {
        next.delete(type);
      } else {
        next.add(type);
      }
      return next;
    });
  }, []);

  const clearBlockTypes = useCallback(() => setSelectedBlockTypes(new Set()), []);

  // ── Pin helpers ───────────────────────────────────────────────────────────
  const togglePin = useCallback(
    (id) => {
      setPinnedIds((prev) => {
        const next = new Set(prev);
        if (next.has(id)) {
          next.delete(id);
        } else {
          next.add(id);
        }
        return next;
      });
    },
    [setPinnedIds]
  );

  // ── Computed: active filter count (for badge/clear button) ────────────────
  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (searchDebounced) count++;
    if (dateRange !== DATE_RANGES.ALL) count++;
    if (selectedBlockTypes.size > 0) count++;
    if (showPinnedOnly) count++;
    return count;
  }, [searchDebounced, dateRange, selectedBlockTypes, showPinnedOnly]);

  // ── Reset all filters ─────────────────────────────────────────────────────
  const resetFilters = useCallback(() => {
    handleSearchChange("");
    setDateRange(DATE_RANGES.ALL);
    setSelectedBlockTypes(new Set());
    setShowPinnedOnly(false);
  }, [handleSearchChange]);

  // ── Available block types derived from the current document set ───────────
  const availableBlockTypes = useMemo(() => {
    if (!documents?.length) return [];
    const typesFound = new Set();
    documents.forEach((doc) => {
      doc.blockTypes?.forEach((t) => typesFound.add(t));
    });
    // Show known types first (in order), then any unknown ones
    const ordered = KNOWN_BLOCK_TYPES.filter((t) => typesFound.has(t));
    typesFound.forEach((t) => {
      if (!ordered.includes(t)) ordered.push(t);
    });
    return ordered;
  }, [documents]);

  // ── Core filtering logic ──────────────────────────────────────────────────
  const filteredDocuments = useMemo(() => {
    if (!documents?.length) return [];

    return documents.filter((doc) => {
      // 1. Search: case-insensitive title match
      if (searchDebounced && !doc.title.toLowerCase().includes(searchDebounced)) {
        return false;
      }

      // 2. Date range: based on updated_at
      if (!isWithinRange(doc.updated_at, dateRange)) {
        return false;
      }

      // 3. Block type filter: document must contain ALL selected types
      if (selectedBlockTypes.size > 0) {
        const docTypes = new Set(doc.blockTypes ?? []);
        for (const required of selectedBlockTypes) {
          if (!docTypes.has(required)) return false;
        }
      }

      // 4. Pinned filter
      if (showPinnedOnly && !pinnedIds.has(doc.id)) {
        return false;
      }

      return true;
    });
  }, [documents, searchDebounced, dateRange, selectedBlockTypes, showPinnedOnly, pinnedIds]);

  return {
    // Raw values for controlled inputs
    searchRaw,
    dateRange,
    selectedBlockTypes,
    showPinnedOnly,
    pinnedIds,

    // Setters
    handleSearchChange,
    setDateRange,
    toggleBlockType,
    clearBlockTypes,
    togglePin,
    setShowPinnedOnly,

    // Derived
    filteredDocuments,
    availableBlockTypes,
    activeFilterCount,
    resetFilters,
  };
}
