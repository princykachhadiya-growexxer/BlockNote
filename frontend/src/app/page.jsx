// // This is a server component — it renders HTML for the landing page.
// // The AppShell (client) handles the redirect to /dashboard when the user
// // is already authenticated, so we don't need any client-side logic here.
// // Keeping it a server component gives us faster initial paint.

// import Link from "next/link";

// export default function HomePage() {
//   return (
//     <div className="flex min-h-full flex-1 flex-col items-center justify-center bg-[#e5f5ff] px-6 py-16">
//       <div className="w-full max-w-md rounded-2xl border border-zinc-200 bg-white p-10 shadow-sm">
//         {/* Logo / brand */}
//         <div className="flex items-center gap-3">
//           <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-zinc-900 text-base font-bold text-white">
//             B
//           </div>
//           <h1 className="text-2xl font-semibold tracking-tight text-zinc-900">
//             BlockNote
//           </h1>
//         </div>

//         <p className="mt-4 text-sm leading-relaxed text-zinc-600">
//           A flexible block editor for writing, organising, and sharing
//           documents — built for focus.
//         </p>

//         {/* Feature highlights */}
//         <ul className="mt-6 space-y-2 text-sm text-zinc-600">
//           {[
//             "Headings, tasks, code blocks and images",
//             "Auto-save with conflict-free ordering",
//             "Share read-only links with one click",
//           ].map((feat) => (
//             <li key={feat} className="flex items-start gap-2">
//               <span className="mt-0.5 text-zinc-400">✦</span>
//               <span>{feat}</span>
//             </li>
//           ))}
//         </ul>

//         {/* CTA buttons */}
//         <div className="mt-8 flex flex-col gap-3 sm:flex-row">
//           <Link
//             href="/login"
//             className="inline-flex h-11 flex-1 items-center justify-center rounded-lg bg-zinc-900 px-4 text-sm font-medium text-white transition hover:bg-zinc-800"
//           >
//             Log in
//           </Link>
//           <Link
//             href="/register"
//             className="inline-flex h-11 flex-1 items-center justify-center rounded-lg border border-zinc-300 bg-white px-4 text-sm font-medium text-zinc-900 transition hover:bg-zinc-50"
//           >
//             Register
//           </Link>
//         </div>

//         <p className="mt-6 text-xs text-zinc-400">
//           No credit card required. Your data stays yours.
//         </p>
//       </div>
//     </div>
//   );
// }

import LandingPage from "@/components/landing/LandingPage";

export default function Home() {
  return <LandingPage />;
}