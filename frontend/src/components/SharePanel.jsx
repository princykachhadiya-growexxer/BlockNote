"use client";

import { useState } from "react";
import { apiEnableShare, apiRevokeShare } from "@/lib/blocks-api";

export default function SharePanel({ docId, initialToken }) {
  const [token, setToken]     = useState(initialToken ?? null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied]   = useState(false);
  const [open, setOpen]       = useState(false);

  const shareUrl = token
    ? `${typeof window !== "undefined" ? window.location.origin : ""}/share/${token}`
    : null;

  async function enable() {
    setLoading(true);
    try {
      const data = await apiEnableShare(docId);
      setToken(data.shareToken);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  async function revoke() {
    if (!confirm("Revoke this share link? Anyone with the link will lose access.")) return;
    setLoading(true);
    try {
      await apiRevokeShare(docId);
      setToken(null);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  async function copy() {
    if (!shareUrl) return;
    await navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-200 bg-white px-3 py-1.5 text-sm font-medium text-zinc-700 hover:bg-zinc-50"
      >
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
        </svg>
        Share
      </button>

      {open && (
        <>
          {/* backdrop */}
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />

          <div className="absolute right-0 top-10 z-50 w-80 rounded-xl border border-zinc-200 bg-white p-4 shadow-xl">
            <h3 className="mb-3 text-sm font-semibold text-zinc-900">Share document</h3>

            {token ? (
              <div className="space-y-3">
                <p className="text-xs text-zinc-500">
                  Anyone with this link can view in read-only mode until you revoke it.
                </p>
                <div className="flex items-center gap-2 rounded-lg border border-zinc-200 bg-zinc-50 p-2">
                  <span className="flex-1 truncate font-mono text-xs text-zinc-600">{shareUrl}</span>
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={copy}
                    className="flex-1 rounded-lg bg-accent py-1.5 text-xs font-medium text-white hover:bg-accent-hover disabled:opacity-60"
                    disabled={loading}
                  >
                    {copied ? "Copied!" : "Copy link"}
                  </button>
                  <button
                    type="button"
                    onClick={revoke}
                    disabled={loading}
                    className="flex-1 rounded-lg border border-red-200 bg-red-50 py-1.5 text-xs font-medium text-red-700 hover:bg-red-100 disabled:opacity-60"
                  >
                    Revoke
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <p className="text-xs text-zinc-500">Generate a read-only share link for this document.</p>
                <button
                  type="button"
                  onClick={enable}
                  disabled={loading}
                  className="w-full rounded-lg bg-accent py-2 text-sm font-medium text-white hover:bg-accent-hover disabled:opacity-60"
                >
                  {loading ? "Generating…" : "Create share link"}
                </button>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
