"use client";

import Link from "next/link";

export default function NavItem({ href, icon, label, active, onNavigate }) {
  return (
    <Link
      href={href}
      onClick={onNavigate}
      className={`flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition ${
        active
          ? "bg-[#B7BCE8] text-[#1A1A1A] shadow-[0_12px_24px_rgba(183,188,232,0.22)]"
          : "text-white/78 hover:bg-white/8 hover:text-white"
      }`}
    >
      <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/8">
        {icon}
      </span>
      <span>{label}</span>
    </Link>
  );
}
