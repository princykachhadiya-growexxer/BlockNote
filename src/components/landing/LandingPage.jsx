import Link from "next/link";

const features = [
  {
    title: "Create Documents",
    description: "Start quick notes, project docs, and knowledge pages in a clean workspace.",
    accent: "bg-[#B7BCE8]",
    icon: <DocumentIcon />,
  },
  {
    title: "Block-Based Editing",
    description: "Mix headings, text, to-do lists, and code blocks without fighting the editor.",
    accent: "bg-[#D1E9F6]",
    icon: <BlocksIcon />,
  },
  {
    title: "Organize Content",
    description: "Keep ideas structured with intuitive sections, spacing, and flexible content flow.",
    accent: "bg-[#E1F0D7]",
    icon: <OrganizeIcon />,
  },
  {
    title: "Share Public Links",
    description: "Publish read-only document links so teammates can view updates instantly.",
    accent: "bg-[#F9D8E6]",
    icon: <ShareIcon />,
  },
];

const steps = [
  {
    number: "01",
    title: "Create a document",
    description: "Open a fresh page for meeting notes, specs, or personal ideas in seconds.",
  },
  {
    number: "02",
    title: "Add and edit blocks",
    description: "Build your page with text, headings, tasks, and code using familiar blocks.",
  },
  {
    number: "03",
    title: "Share with a link",
    description: "Generate a public read-only link when you are ready to share your work.",
  },
];

export default function LandingPage() {
  return (
    <main className="relative isolate overflow-hidden bg-[linear-gradient(180deg,#ABB0DB_0%,#D9E4F8_100%)] text-[#1A1A1A]">
      <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[34rem] bg-[radial-gradient(circle_at_top_left,_rgba(249,216,230,0.95),_transparent_34%),radial-gradient(circle_at_top_right,_rgba(183,188,232,0.7),_transparent_32%)]" />
      <div className="pointer-events-none absolute left-[-8rem] top-40 -z-10 h-64 w-64 rounded-full bg-white/30 blur-3xl" />
      <div className="pointer-events-none absolute bottom-10 right-[-6rem] -z-10 h-72 w-72 rounded-full bg-[#D1E9F6]/70 blur-3xl" />

      <div className="mx-auto flex min-h-screen w-full max-w-7xl flex-col px-5 sm:px-8 lg:px-10">
        {/* Navbar */}
        <header className="landing-fade-up sticky top-0 z-20 pt-5">
          <nav className="flex items-center justify-between gap-3 rounded-full border border-white/50 bg-white/75 px-4 py-3 shadow-[0_16px_50px_rgba(75,85,120,0.12)] backdrop-blur md:px-6">
            <Link href="/" className="flex items-center gap-3">
              <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#2D2D2D] text-lg font-semibold text-white shadow-lg shadow-black/10">
                B
              </span>
              <div>
                <p className="text-sm font-medium uppercase tracking-[0.24em] text-[#5E6483]">
                  BlockNote
                </p>
                <p className="hidden text-sm text-[#4D556D] sm:block">Document editing made simple</p>
              </div>
            </Link>

            <div className="flex shrink-0 items-center gap-2 sm:gap-3">
              <Link
                href="/login"
                className="inline-flex h-10 items-center justify-center rounded-full border border-[#1A1A1A]/10 bg-white px-4 text-sm font-medium text-[#1A1A1A] transition duration-200 hover:-translate-y-0.5 hover:bg-[#F8FAFF] hover:shadow-lg sm:h-11 sm:px-5"
              >
                Login
              </Link>
              <Link
                href="/register"
                className="inline-flex h-10 items-center justify-center rounded-full bg-[#2D2D2D] px-4 text-sm font-medium text-white transition duration-200 hover:-translate-y-0.5 hover:bg-[#1F1F1F] hover:shadow-lg sm:h-11 sm:px-5"
              >
                Register
              </Link>
            </div>
          </nav>
        </header>

        {/* Hero */}
        <section className="grid flex-1 items-center gap-14 py-16 lg:grid-cols-[1.05fr_0.95fr] lg:py-20">
          <div className="landing-fade-up space-y-8">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/50 bg-white/70 px-4 py-2 text-sm font-medium text-[#5E6483] shadow-sm backdrop-blur">
              <span className="h-2 w-2 rounded-full bg-[#B7BCE8]" />
              Simplified Notion-style editor for focused work
            </div>

            <div className="space-y-5">
              <h1 className="max-w-3xl text-4xl font-semibold leading-tight sm:text-5xl lg:text-6xl">
                Write, organize, and share your ideas in one beautiful workspace.
              </h1>
              <p className="max-w-2xl text-base leading-8 text-[#4D556D] sm:text-lg">
                Create documents, edit with flexible content blocks, keep pages tidy, and share
                public read-only links when your work is ready to be seen.
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <Link
                href="/register"
                className="inline-flex h-[3.25rem] items-center justify-center rounded-full bg-[#2D2D2D] px-7 text-sm font-semibold text-white transition duration-200 hover:-translate-y-0.5 hover:bg-[#1F1F1F] hover:shadow-[0_16px_30px_rgba(45,45,45,0.18)]"
              >
                Get Started
              </Link>
              <Link
                href="/login"
                className="inline-flex h-[3.25rem] items-center justify-center rounded-full border border-[#1A1A1A]/10 bg-white/85 px-7 text-sm font-semibold text-[#1A1A1A] transition duration-200 hover:-translate-y-0.5 hover:bg-white hover:shadow-lg"
              >
                Login
              </Link>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <StatCard value="4+" label="block types ready" />
              <StatCard value="Fast" label="editing experience" />
              <StatCard value="Public" label="sharing support" />
            </div>
          </div>

          <div className="landing-fade-up lg:justify-self-end" style={{ animationDelay: "120ms" }}>
            <MockEditor />
          </div>
        </section>

        {/* Features */}
        <section className="space-y-8 py-8 sm:py-12">
          <div className="landing-fade-up max-w-2xl">
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[#5E6483]">
              Core Features
            </p>
            <h2 className="mt-3 text-3xl font-semibold sm:text-4xl">
              Everything needed for a streamlined document workflow.
            </h2>
          </div>

          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
            {features.map((feature, index) => (
              <FeatureCard key={feature.title} feature={feature} delay={`${index * 90}ms`} />
            ))}
          </div>
        </section>

        {/* How it works */}
        <section className="space-y-8 py-14 sm:py-20">
          <div className="landing-fade-up max-w-2xl">
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[#5E6483]">
              How It Works
            </p>
            <h2 className="mt-3 text-3xl font-semibold sm:text-4xl">
              From first draft to shared page in three simple steps.
            </h2>
          </div>

          <div className="grid gap-5 lg:grid-cols-3">
            {steps.map((step, index) => (
              <StepCard key={step.number} step={step} delay={`${index * 100}ms`} />
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="py-4 pb-16 sm:pb-20">
          <div className="landing-fade-up rounded-[2rem] border border-white/50 bg-white/80 p-8 shadow-[0_24px_70px_rgba(75,85,120,0.14)] backdrop-blur sm:p-10 lg:flex lg:items-center lg:justify-between">
            <div className="max-w-2xl">
              <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[#5E6483]">
                Start Today
              </p>
              <h2 className="mt-3 text-3xl font-semibold sm:text-4xl">
                Turn scattered notes into organized, shareable documents.
              </h2>
              <p className="mt-4 text-base leading-8 text-[#4D556D]">
                Sign up for free and begin writing in a calmer, more structured editing
                experience.
              </p>
            </div>

            <div className="mt-8 lg:mt-0">
              <Link
                href="/register"
                className="inline-flex h-[3.25rem] items-center justify-center rounded-full bg-[#2D2D2D] px-7 text-sm font-semibold text-white transition duration-200 hover:-translate-y-0.5 hover:bg-[#1F1F1F] hover:shadow-[0_16px_30px_rgba(45,45,45,0.18)]"
              >
                Start for Free
              </Link>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="border-t border-white/50 py-6 text-sm text-[#4D556D]">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p>BlockNote</p>
            <div className="flex items-center gap-5">
              <Link href="/login" className="transition hover:text-[#1A1A1A]">
                Login
              </Link>
              <Link href="/register" className="transition hover:text-[#1A1A1A]">
                Register
              </Link>
            </div>
          </div>
        </footer>
      </div>
    </main>
  );
}

function FeatureCard({ feature, delay }) {
  return (
    <article
      className="landing-fade-up group rounded-[1.75rem] border border-white/60 bg-white/85 p-6 shadow-[0_18px_45px_rgba(75,85,120,0.12)] transition duration-300 hover:-translate-y-1.5 hover:shadow-[0_24px_60px_rgba(75,85,120,0.16)]"
      style={{ animationDelay: delay }}
    >
      <div className={`flex h-14 w-14 items-center justify-center rounded-2xl ${feature.accent}`}>
        {feature.icon}
      </div>
      <h3 className="mt-5 text-xl font-semibold">{feature.title}</h3>
      <p className="mt-3 text-sm leading-7 text-[#4D556D]">{feature.description}</p>
    </article>
  );
}

function StepCard({ step, delay }) {
  return (
    <article
      className="landing-fade-up rounded-[1.75rem] border border-white/60 bg-white/75 p-6 shadow-[0_18px_45px_rgba(75,85,120,0.1)] backdrop-blur"
      style={{ animationDelay: delay }}
    >
      <p className="text-sm font-semibold tracking-[0.22em] text-[#5E6483]">{step.number}</p>
      <h3 className="mt-4 text-2xl font-semibold">{step.title}</h3>
      <p className="mt-3 text-sm leading-7 text-[#4D556D]">{step.description}</p>
    </article>
  );
}

function StatCard({ value, label }) {
  return (
    <div className="rounded-[1.5rem] border border-white/55 bg-white/70 px-5 py-4 shadow-sm backdrop-blur">
      <p className="text-2xl font-semibold">{value}</p>
      <p className="mt-1 text-sm text-[#5E6483]">{label}</p>
    </div>
  );
}

function MockEditor() {
  return (
    <div className="landing-float relative mx-auto max-w-[36rem]">
      <div className="absolute -left-6 top-16 hidden h-24 w-24 rounded-[2rem] bg-[#F9D8E6]/90 shadow-lg blur-[1px] md:block" />
      <div className="absolute -right-4 top-[-1rem] hidden h-20 w-20 rounded-[1.5rem] bg-[#E1F0D7] shadow-lg md:block" />

      <div className="overflow-hidden rounded-[2rem] border border-white/60 bg-white/90 shadow-[0_30px_80px_rgba(75,85,120,0.18)] backdrop-blur">
        <div className="flex items-center justify-between border-b border-[#1A1A1A]/6 bg-[#F7F9FD] px-5 py-4">
          <div className="flex items-center gap-2">
            <span className="h-3 w-3 rounded-full bg-[#F9D8E6]" />
            <span className="h-3 w-3 rounded-full bg-[#D1E9F6]" />
            <span className="h-3 w-3 rounded-full bg-[#E1F0D7]" />
          </div>
          <div className="rounded-full bg-white px-3 py-1 text-xs font-medium text-[#5E6483] shadow-sm">
            Product roadmap
          </div>
        </div>

        <div className="grid md:grid-cols-[110px_1fr]">
          <aside className="hidden bg-[#2D2D2D] px-4 py-5 text-sm text-white/75 md:block">
            <p className="text-xs uppercase tracking-[0.22em] text-white/45">Workspace</p>
            <div className="mt-5 space-y-3">
              <div className="rounded-xl bg-white/10 px-3 py-2 text-white">Docs</div>
              <div className="rounded-xl px-3 py-2">Tasks</div>
              <div className="rounded-xl px-3 py-2">Snippets</div>
            </div>
          </aside>

          <div className="space-y-5 px-5 py-6 sm:px-7 sm:py-7">
            <div className="space-y-3">
              <div className="h-3 w-24 rounded-full bg-[#B7BCE8]/60" />
              <div className="h-7 w-4/5 rounded-full bg-[#1A1A1A]/8" />
              <div className="h-4 w-full rounded-full bg-[#1A1A1A]/8" />
              <div className="h-4 w-11/12 rounded-full bg-[#1A1A1A]/8" />
            </div>

            <div className="space-y-3 rounded-[1.5rem] bg-[#D1E9F6]/55 p-4">
              <div className="flex items-center gap-3">
                <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-white text-sm">+</span>
                <div className="h-4 w-40 rounded-full bg-white/80" />
              </div>
              <div className="grid gap-2 sm:grid-cols-2">
                <div className="rounded-2xl bg-white/85 p-3">
                  <div className="h-3 w-16 rounded-full bg-[#1A1A1A]/10" />
                  <div className="mt-3 h-3 w-full rounded-full bg-[#1A1A1A]/10" />
                  <div className="mt-2 h-3 w-4/5 rounded-full bg-[#1A1A1A]/10" />
                </div>
                <div className="rounded-2xl bg-white/85 p-3">
                  <div className="h-3 w-20 rounded-full bg-[#1A1A1A]/10" />
                  <div className="mt-3 h-3 w-full rounded-full bg-[#1A1A1A]/10" />
                  <div className="mt-2 h-3 w-3/5 rounded-full bg-[#1A1A1A]/10" />
                </div>
              </div>
            </div>

            <div className="rounded-[1.5rem] bg-[#E1F0D7]/75 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="h-3 w-20 rounded-full bg-[#1A1A1A]/10" />
                  <div className="mt-3 h-3 w-36 rounded-full bg-[#1A1A1A]/10" />
                </div>
                <span className="rounded-full bg-white px-3 py-1 text-xs font-medium text-[#4D556D]">
                  Share link
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function DocumentIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="h-6 w-6 text-[#2D2D2D]" fill="none">
      <path d="M8 3.75h5.5L18.25 8.5V19a1.25 1.25 0 0 1-1.25 1.25H8A1.25 1.25 0 0 1 6.75 19V5A1.25 1.25 0 0 1 8 3.75Z" stroke="currentColor" strokeWidth="1.6" />
      <path d="M13.25 3.75V8.5H18" stroke="currentColor" strokeWidth="1.6" />
      <path d="M9.5 12h5M9.5 15.5h5" stroke="currentColor" strokeLinecap="round" strokeWidth="1.6" />
    </svg>
  );
}

function BlocksIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="h-6 w-6 text-[#2D2D2D]" fill="none">
      <rect x="4" y="5" width="7" height="6" rx="1.5" stroke="currentColor" strokeWidth="1.6" />
      <rect x="13" y="5" width="7" height="6" rx="1.5" stroke="currentColor" strokeWidth="1.6" />
      <rect x="4" y="13" width="16" height="6" rx="1.5" stroke="currentColor" strokeWidth="1.6" />
    </svg>
  );
}

function OrganizeIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="h-6 w-6 text-[#2D2D2D]" fill="none">
      <path d="M6.5 6.5h11M6.5 12h11M6.5 17.5h6" stroke="currentColor" strokeLinecap="round" strokeWidth="1.6" />
      <circle cx="4.5" cy="6.5" r="1" fill="currentColor" />
      <circle cx="4.5" cy="12" r="1" fill="currentColor" />
      <circle cx="4.5" cy="17.5" r="1" fill="currentColor" />
    </svg>
  );
}

function ShareIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="h-6 w-6 text-[#2D2D2D]" fill="none">
      <path d="M14.75 6.25h2a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2h-8a2 2 0 0 1-2-2v-2" stroke="currentColor" strokeWidth="1.6" />
      <path d="M10 14 18 6M12.75 6H18v5.25" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.6" />
      <path d="M5.25 9.25h6.5v6.5h-6.5z" stroke="currentColor" strokeWidth="1.6" />
    </svg>
  );
}
