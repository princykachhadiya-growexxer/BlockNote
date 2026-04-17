import Link from "next/link";

const guideSections = [
  {
    eyebrow: "Overview",
    title: "What BlockNote is for",
    body:
      "BlockNote is a focused workspace for writing, organizing, and sharing documents in a block-based editor. Each document is made up of flexible blocks, so you can mix paragraphs, headings, code, tasks, dividers, and images without leaving the same page.",
    points: [
      "Use the dashboard to browse, search, and filter your documents.",
      "Open a document to write in real time with automatic saving.",
      "Keep important work visible by starring documents and individual blocks.",
    ],
  },
  {
    eyebrow: "Documents",
    title: "Create and manage documents",
    body:
      "Your main workflow starts on the dashboard. From there you can create a new document, reopen recent work, rename items, and keep your workspace tidy as documents grow.",
    points: [
      "Create a document from the dashboard and open it instantly in the editor.",
      "Edit the title at the top of a page and changes save automatically.",
      "Use search and filters to find documents by text, block type, date range, or pinned status.",
    ],
  },
  {
    eyebrow: "Editor",
    title: "Work block by block",
    body:
      "Inside a document, writing happens block by block. This makes it easy to structure content, rearrange ideas, and mix different content types without interrupting your flow.",
    points: [
      "Press Enter to split content into a new block.",
      "Use drag handles to reorder blocks when a section needs to move.",
      "Insert text, headings, code, tasks, dividers, and images in the same document.",
    ],
  },
  {
    eyebrow: "Sharing",
    title: "Share and revisit important work",
    body:
      "When a page is ready, you can share it and highlight important content so it stays easy to return to later.",
    points: [
      "Use the Share action inside a document to generate a shareable read-only link.",
      "Star a document to pin it as important in your workspace.",
      "Star an individual block when a specific note, idea, or reference deserves quick access.",
    ],
  },
  {
    eyebrow: "Workflow",
    title: "Daily flow in a few steps",
    body:
      "A simple routine helps most people get value from the app quickly: create a page, write in blocks, star what matters, and use the dashboard to keep everything organized.",
    points: [
      "Start in the dashboard and open or create the document you need.",
      "Write freely, add images or tasks where useful, and let the editor save for you.",
      "Use Starred for important items and Trash for recovery when something was removed by mistake.",
    ],
  },
];

export const metadata = {
  title: "Guide | BlockNote",
  description: "Learn how to use BlockNote to create, organize, and share documents.",
};

export default function GuidePage() {
  return (
    <div className="min-h-full flex-1 px-4 py-8 sm:px-8">
      <div className="mx-auto max-w-5xl">
        <header className="rounded-[2rem] border border-[var(--edge)] bg-[linear-gradient(135deg,color-mix(in_srgb,var(--surface)_92%,white_8%),color-mix(in_srgb,var(--accent)_50%,transparent),color-mix(in_srgb,var(--accent-green)_72%,transparent))] px-6 py-7 shadow-[0_24px_70px_rgba(74,83,120,0.08)] backdrop-blur">
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[var(--muted)]">
            Guide
          </p>
          <h1 className="mt-3 max-w-3xl text-3xl font-semibold text-[var(--foreground)] sm:text-4xl">
            Learn how the workspace fits together before you dive in.
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-[var(--muted)]">
            This page walks through the core ideas behind BlockNote, how to
            manage documents, and the quickest way to move from drafting to
            sharing.
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href="/dashboard"
              className="inline-flex rounded-2xl bg-[#2D2D2D] px-5 py-3 text-sm font-semibold text-white transition hover:bg-black"
            >
              Open dashboard
            </Link>
            <Link
              href="/starred"
              className="inline-flex rounded-2xl border border-[var(--edge)] bg-[var(--surface)]/75 px-5 py-3 text-sm font-semibold text-[var(--foreground)] transition hover:bg-[var(--surface)]"
            >
              View starred items
            </Link>
          </div>
        </header>

        <main className="mt-8 space-y-5">
          {guideSections.map((section) => (
            <section
              key={section.title}
              className="rounded-[1.75rem] border border-[var(--edge)] bg-[var(--surface)] p-6 shadow-[0_18px_50px_rgba(74,83,120,0.08)] sm:p-7"
            >
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--muted)]">
                {section.eyebrow}
              </p>
              <h2 className="mt-3 text-2xl font-semibold text-[var(--foreground)]">
                {section.title}
              </h2>
              <p className="mt-3 max-w-3xl text-sm leading-7 text-[var(--muted)]">
                {section.body}
              </p>

              <ul className="mt-5 grid gap-3 sm:grid-cols-3">
                {section.points.map((point) => (
                  <li
                    key={point}
                    className="rounded-[1.35rem] border border-[var(--edge)] bg-[var(--surface-muted)] px-4 py-4 text-sm leading-6 text-[var(--foreground)]"
                  >
                    {point}
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </main>
      </div>
    </div>
  );
}
