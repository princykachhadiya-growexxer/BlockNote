"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import AuthCard from "@/components/auth/AuthCard";
import { useAuth } from "@/components/providers/AuthProvider";

export default function LoginPage() {
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
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.message ?? "Could not log in.");
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
      <div className="pointer-events-none absolute left-[-5rem] top-20 h-56 w-56 rounded-full bg-white/35 blur-3xl" />
      <div className="pointer-events-none absolute bottom-0 right-[-4rem] h-72 w-72 rounded-full bg-[#F9D8E6]/70 blur-3xl" />

      <div className="grid w-full max-w-6xl items-center gap-12 lg:grid-cols-[0.95fr_1.05fr]">
        <div className="hidden lg:block">
          <div className="max-w-xl space-y-6 text-[#1A1A1A]">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[#5E6483]">Welcome Back</p>
            <h2 className="text-5xl font-semibold leading-tight">
              Pick up where you left off in your workspace.
            </h2>
            <p className="text-lg leading-8 text-[#4D556D]">
              Review notes, structure documents, and continue writing with a calmer, cleaner editor built for focus.
            </p>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-[1.5rem] border border-white/55 bg-white/72 p-5 shadow-lg shadow-[#5B678D]/10 backdrop-blur">
                <p className="text-sm font-semibold text-[#1A1A1A]">Block editing</p>
                <p className="mt-2 text-sm leading-7 text-[#5E6483]">Use headings, tasks, code, and media in one flexible flow.</p>
              </div>
              <div className="rounded-[1.5rem] border border-white/55 bg-white/72 p-5 shadow-lg shadow-[#5B678D]/10 backdrop-blur">
                <p className="text-sm font-semibold text-[#1A1A1A]">Share cleanly</p>
                <p className="mt-2 text-sm leading-7 text-[#5E6483]">Generate public read-only links whenever a page is ready.</p>
              </div>
            </div>
          </div>
        </div>

        <AuthCard
          title="Log in"
          subtitle="Use the email and password you registered with to access your documents."
          accent="blue"
          footer={(
            <>
              No account?{" "}
              <Link href="/register" className="font-semibold text-[var(--foreground)] underline-offset-2 hover:underline">
                Register
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
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-2 w-full rounded-2xl border border-[var(--edge)] bg-[var(--surface-muted)] px-4 py-3 text-sm text-[var(--foreground)] outline-none ring-0 placeholder:text-[var(--muted)] focus:border-[#B7BCE8] focus:bg-[var(--surface)] focus:shadow-[0_0_0_4px_rgba(183,188,232,0.24)]"
              />
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
              {loading ? "Signing in…" : "Sign in"}
            </button>
          </form>
        </AuthCard>
      </div>
    </div>
  );
}
