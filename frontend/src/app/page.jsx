import Link from "next/link";

export default function Home() {
  return (
    <div className="flex min-h-full flex-1 flex-col items-center justify-center bg-[#e5f5ff] px-6 py-16">
      <div className="w-full max-w-md rounded-2xl border border-zinc-200 bg-white p-10 shadow-sm">
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-900">
          BlockNote
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-zinc-600">
          Browser-based block documents with auth and a document list. Sign in
          to open your dashboard.
        </p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Link
            href="/login"
            className="inline-flex h-11 flex-1 items-center justify-center rounded-lg bg-zinc-900 px-4 text-sm font-medium text-white transition hover:bg-zinc-800"
          >
            Log in
          </Link>
          <Link
            href="/register"
            className="inline-flex h-11 flex-1 items-center justify-center rounded-lg border border-zinc-300 bg-white px-4 text-sm font-medium text-zinc-900 transition hover:bg-zinc-50"
          >
            Register
          </Link>
        </div>
        <p className="mt-6 text-xs text-zinc-500">
          A browser-based block document editor.{" "}
        </p>
      </div>
    </div>
  );
}
