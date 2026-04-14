import Link from "next/link";

export default async function DocumentStubPage({ params }) {
  const { id } = await params;
  return (
    <div className="flex min-h-full flex-1 flex-col items-center justify-center bg-zinc-50 px-6 py-16">
      <div className="max-w-md rounded-2xl border border-zinc-200 bg-white p-8 text-center shadow-sm">
        <p className="text-sm font-medium text-zinc-500">Document</p>
        <p className="mt-2 break-all font-mono text-xs text-zinc-400">{id}</p>
        <h1 className="mt-4 text-lg font-semibold text-zinc-900">Editor (Day 2+)</h1>
        <p className="mt-2 text-sm text-zinc-600">
          The block editor, auto-save, and sharing are implemented in later milestones. For Day 1, use the dashboard to manage documents.
        </p>
        <Link
          href="/dashboard"
          className="mt-6 inline-flex h-10 items-center justify-center rounded-lg bg-zinc-900 px-4 text-sm font-medium text-white hover:bg-zinc-800"
        >
          Back to dashboard
        </Link>
      </div>
    </div>
  );
}
