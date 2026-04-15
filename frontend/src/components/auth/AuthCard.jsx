"use client";

export default function AuthCard({
  title,
  subtitle,
  accent = "purple",
  footer,
  children,
}) {
  const accentClass = {
    purple: "bg-[#B7BCE8]",
    blue: "bg-[#D1E9F6]",
    green: "bg-[#E1F0D7]",
    pink: "bg-[#F9D8E6]",
  }[accent] ?? "bg-[#B7BCE8]";

  return (
    <div className="relative overflow-hidden rounded-[2rem] border border-white/70 bg-white/92 p-8 shadow-[0_28px_80px_rgba(74,83,120,0.18)] backdrop-blur sm:p-10">
      <div className={`absolute right-0 top-0 h-24 w-24 rounded-bl-[2rem] ${accentClass} opacity-80`} />
      <div className="relative">
        <div className="mb-8 flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#2D2D2D] text-lg font-semibold text-white shadow-lg shadow-black/10">
            B
          </div>
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[#5E6483]">BlockNote</p>
            <p className="text-sm text-[var(--muted)]">Focused documents, structured beautifully</p>
          </div>
        </div>

        <h1 className="text-3xl font-semibold text-[var(--foreground)]">{title}</h1>
        <p className="mt-3 text-sm leading-7 text-[var(--muted)]">{subtitle}</p>

        <div className="mt-8">{children}</div>

        {footer ? <div className="mt-8 text-center text-sm text-[var(--muted)]">{footer}</div> : null}
      </div>
    </div>
  );
}
