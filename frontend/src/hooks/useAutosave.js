import { useCallback, useEffect, useRef, useState } from "react";

/**
 * useAutosave
 *
 * Accepts a `saveFn(signal) → Promise` factory.
 * Debounces calls by `delay` ms.
 * Cancels in-flight requests when a newer save arrives (AbortController).
 * Tracks "idle" | "pending" | "saving" | "saved" | "error" status.
 *
 * @param {(signal: AbortSignal) => Promise<void>} saveFn
 * @param {number} delay  debounce ms (default 1000)
 */
export function useAutosave(saveFn, delay = 1000) {
  const [status, setStatus] = useState("idle"); // idle | pending | saving | saved | error
  const timerRef = useRef(null);
  const abortRef = useRef(null);
  const saveFnRef = useRef(saveFn);

  // Always use the latest saveFn without re-triggering effects
  useEffect(() => {
    saveFnRef.current = saveFn;
  }, [saveFn]);

  const trigger = useCallback(() => {
    setStatus("pending");

    // Clear any pending debounce
    if (timerRef.current) clearTimeout(timerRef.current);

    timerRef.current = setTimeout(async () => {
      // Cancel any in-flight save
      if (abortRef.current) abortRef.current.abort();
      const controller = new AbortController();
      abortRef.current = controller;

      setStatus("saving");
      try {
        await saveFnRef.current(controller.signal);
        // Only update status if this save wasn't superseded
        if (!controller.signal.aborted) {
          setStatus("saved");
        }
      } catch (err) {
        if (err?.name === "AbortError") return; // superseded — silent
        console.error("[autosave] error:", err);
        if (!controller.signal.aborted) {
          setStatus("error");
        }
      }
    }, delay);
  }, [delay]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      if (abortRef.current) abortRef.current.abort();
    };
  }, []);

  return { trigger, status };
}
