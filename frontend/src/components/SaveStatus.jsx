"use client";

/**
 * SaveStatus
 * Shows the autosave state in the toolbar.
 */
export default function SaveStatus({ status }) {
  if (status === "idle") return null;

  const config = {
    pending: { label: "Unsaved changes", cls: "text-zinc-400" },
    saving:  { label: "Saving…",         cls: "text-zinc-400 animate-pulse" },
    saved:   { label: "Saved",           cls: "text-emerald-600" },
    error:   { label: "Save failed",     cls: "text-red-500" },
  }[status] ?? { label: "", cls: "" };

  return (
    <span className={`text-xs font-medium transition-all ${config.cls}`}>
      {config.label}
    </span>
  );
}
