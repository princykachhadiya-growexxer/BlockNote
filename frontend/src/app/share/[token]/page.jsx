"use client";

import { useEffect, useState } from "react";
import { fetchSharedDocument } from "@/lib/blocks-api";
import Link from "next/link";
import { escapeHtml, sanitizeRichTextHtml } from "@/lib/rich-text";

export default function SharedDocPage({ params }) {
  const { token } = params;
  const [data, setData]     = useState(null);
  const [error, setError]   = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSharedDocument(token)
      .then(setData)
      .catch((e) => setError(e.message === "NOT_FOUND" ? "not_found" : "error"))
      .finally(() => setLoading(false));
  }, [token]);

  if (loading) {
    return <Centered>Loading shared document…</Centered>;
  }

  if (error === "not_found") {
    return (
      <Centered>
        <p className="text-zinc-500">This share link is invalid or has been revoked.</p>
        <Link href="/" className="mt-4 inline-block text-sm text-accent underline">
          Go home
        </Link>
      </Centered>
    );
  }

  if (error) {
    return <Centered><p className="text-red-500">Failed to load document.</p></Centered>;
  }

  const { document: doc, blocks } = data;
  const sorted = [...blocks].sort((a, b) => a.order_index - b.order_index);

  return (
    <div className="min-h-screen bg-white">
      <header className="sticky top-0 z-10 border-b border-zinc-200 bg-white/90 px-6 py-3 backdrop-blur">
        <div className="mx-auto flex max-w-3xl items-center justify-between">
          <span className="text-sm font-medium text-zinc-500">Read-only · BlockNote</span>
          <Link href="/" className="text-sm text-accent hover:underline">
            Sign in
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-6 py-12">
        <h1 className="mb-8 text-4xl font-bold text-zinc-900">{doc.title || "Untitled"}</h1>

        <div className="space-y-2">
          {sorted.map((block) => (
            <ReadOnlyBlock key={block.id} block={block} />
          ))}
        </div>
      </main>
    </div>
  );
}

function ReadOnlyBlock({ block }) {
  const richHtml = sanitizeRichTextHtml(block.content?.html ?? "");
  const fallbackHtml = escapeHtml(block.content?.text ?? "").replace(/\n/g, "<br>");
  const html = richHtml || fallbackHtml;

  switch (block.type) {
    case "heading_1":
      return (
        <h2
          className="mt-6 text-3xl font-bold text-zinc-900"
          dangerouslySetInnerHTML={{ __html: html }}
        />
      );
    case "heading_2":
      return (
        <h3
          className="mt-4 text-xl font-semibold text-zinc-800"
          dangerouslySetInnerHTML={{ __html: html }}
        />
      );
    case "todo":
      return (
        <div className="flex items-start gap-2">
          <input
            type="checkbox"
            checked={!!block.content?.checked}
            readOnly
            className="mt-1 h-4 w-4 shrink-0 rounded border-zinc-300"
          />
          <p
            className="text-sm text-zinc-700"
            dangerouslySetInnerHTML={{ __html: html }}
          />
        </div>
      );
    case "code":
      return (
        <pre className="overflow-x-auto rounded-md bg-zinc-100 px-4 py-3 font-mono text-sm text-zinc-800 whitespace-pre-wrap">
          {block.content?.text}
        </pre>
      );
    case "divider":
      return <hr className="my-4 border-zinc-300" />;
    case "image":
      return block.content?.url ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={block.content.url}
          alt={block.content?.alt ?? ""}
          className="max-h-96 rounded-lg object-contain"
        />
      ) : null;
    default: // paragraph
      return (
        <p
          className="text-sm leading-relaxed text-zinc-700"
          dangerouslySetInnerHTML={{ __html: html }}
        />
      );
  }
}

function Centered({ children }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-2 bg-white text-sm text-zinc-600">
      {children}
    </div>
  );
}
