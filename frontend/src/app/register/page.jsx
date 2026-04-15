"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import AuthCard from "@/components/auth/AuthCard";
import { useAuth } from "@/components/providers/AuthProvider";

export default function RegisterPage() {
  const router = useRouter();
  const { setAuthSession } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.message ?? "Could not register.");
        return;
      }
      setAuthSession(data);
      router.push("/dashboard");
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="relative flex min-h-full flex-1 items-center justify-center overflow-hidden bg-[linear-gradient(180deg,#ABB0DB_0%,#D9E4F8_100%)] px-6 py-16">
      <div className="pointer-events-none absolute left-[-4rem] top-16 h-56 w-56 rounded-full bg-white/30 blur-3xl" />
      <div className="pointer-events-none absolute bottom-[-5rem] right-0 h-80 w-80 rounded-full bg-[#E1F0D7]/70 blur-3xl" />

      <div className="grid w-full max-w-6xl items-center gap-12 lg:grid-cols-[1.02fr_0.98fr]">
        <AuthCard
          title="Create account"
          subtitle="Start writing, organizing, and sharing documents in a workspace designed for clarity."
          accent="green"
          footer={(
            <>
              Already have an account?{" "}
              <Link href="/login" className="font-semibold text-[var(--foreground)] underline-offset-2 hover:underline">
                Log in
              </Link>
            </>
          )}
        >
          <form onSubmit={onSubmit} className="space-y-5">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-[var(--foreground)]">
                Email
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-2 w-full rounded-2xl border border-[var(--edge)] bg-[var(--surface-muted)] px-4 py-3 text-sm text-[var(--foreground)] outline-none ring-0 placeholder:text-[var(--muted)] focus:border-[#B7BCE8] focus:bg-[var(--surface)] focus:shadow-[0_0_0_4px_rgba(183,188,232,0.24)]"
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-[var(--foreground)]">
                Password
              </label>
              <input
                id="password"
                type="password"
                autoComplete="new-password"
                required
                minLength={8}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-2 w-full rounded-2xl border border-[var(--edge)] bg-[var(--surface-muted)] px-4 py-3 text-sm text-[var(--foreground)] outline-none ring-0 placeholder:text-[var(--muted)] focus:border-[#B7BCE8] focus:bg-[var(--surface)] focus:shadow-[0_0_0_4px_rgba(183,188,232,0.24)]"
              />
              <p className="mt-2 text-xs text-[var(--muted)]">
                Password must be at least 8 characters and include at least one number.
              </p>
            </div>
            {error ? (
              <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            ) : null}
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-2xl bg-[#2D2D2D] py-3 text-sm font-semibold text-white shadow-[0_18px_34px_rgba(45,45,45,0.18)] transition hover:-translate-y-0.5 hover:bg-[#1F1F1F] disabled:translate-y-0 disabled:opacity-60"
            >
              {loading ? "Creating account…" : "Register"}
            </button>
          </form>
        </AuthCard>

        <div className="hidden lg:block">
          <div className="ml-auto max-w-xl space-y-6 text-[#1A1A1A]">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[#5E6483]">Start Free</p>
            <h2 className="text-5xl font-semibold leading-tight">
              Build a calmer knowledge space for notes, docs, and ideas.
            </h2>
            <p className="text-lg leading-8 text-[#4D556D]">
              Capture information in flexible blocks, keep structure intuitive, and share polished pages whenever you are ready.
            </p>
            <div className="grid gap-4">
              <div className="rounded-[1.6rem] border border-white/55 bg-white/72 p-6 shadow-lg shadow-[#5B678D]/10 backdrop-blur">
                <p className="text-sm font-semibold text-[#1A1A1A]">Designed for modern teams</p>
                <p className="mt-2 text-sm leading-7 text-[#5E6483]">Minimal UI, strong hierarchy, and a writing experience inspired by the best block editors.</p>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-[1.5rem] border border-white/55 bg-white/72 p-5 shadow-lg shadow-[#5B678D]/10 backdrop-blur">
                  <p className="text-sm font-semibold text-[#1A1A1A]">Write faster</p>
                  <p className="mt-2 text-sm leading-7 text-[#5E6483]">Headings, tasks, code, and media in one seamless canvas.</p>
                </div>
                <div className="rounded-[1.5rem] border border-white/55 bg-white/72 p-5 shadow-lg shadow-[#5B678D]/10 backdrop-blur">
                  <p className="text-sm font-semibold text-[#1A1A1A]">Stay organized</p>
                  <p className="mt-2 text-sm leading-7 text-[#5E6483]">Use your dashboard and starred pages to keep important work close.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
