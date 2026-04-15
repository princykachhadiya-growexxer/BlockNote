"use client";

import { useEffect, useRef, useState } from "react";
import { filterCommands } from "@/lib/slash-commands";

/**
 * SlashMenu
 *
 * Props:
 *   query       string  — text typed after "/"
 *   onSelect    (commandId) => void
 *   onClose     () => void
 *   anchorRect  DOMRect | null  — position of the caret
 */
export default function SlashMenu({ query, onSelect, onClose, anchorRect }) {
  const [activeIdx, setActiveIdx] = useState(0);
  const menuRef = useRef(null);
  const commands = filterCommands(query);

  // Reset active index when query changes
  useEffect(() => {
    setActiveIdx(0);
  }, [query]);

  // Keyboard navigation
  useEffect(() => {
    function onKeyDown(e) {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setActiveIdx((i) => (i + 1) % Math.max(commands.length, 1));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setActiveIdx((i) => (i - 1 + Math.max(commands.length, 1)) % Math.max(commands.length, 1));
      } else if (e.key === "Enter") {
        e.preventDefault();
        if (commands[activeIdx]) onSelect(commands[activeIdx].id);
      } else if (e.key === "Escape") {
        e.preventDefault();
        onClose();
      }
    }

    window.addEventListener("keydown", onKeyDown, true);
    return () => window.removeEventListener("keydown", onKeyDown, true);
  }, [commands, activeIdx, onSelect, onClose]);

  // Scroll active item into view
  useEffect(() => {
    const item = menuRef.current?.querySelector(`[data-idx="${activeIdx}"]`);
    item?.scrollIntoView({ block: "nearest" });
  }, [activeIdx]);

  if (!commands.length) {
    return (
      <MenuContainer anchorRect={anchorRect} menuRef={menuRef}>
        <p className="px-3 py-2 text-xs text-zinc-400">No results</p>
      </MenuContainer>
    );
  }

  return (
    <MenuContainer anchorRect={anchorRect} menuRef={menuRef}>
      {commands.map((cmd, idx) => (
        <button
          key={cmd.id}
          data-idx={idx}
          type="button"
          onMouseDown={(e) => {
            // Use mousedown so the editor doesn't lose focus before we handle it
            e.preventDefault();
            onSelect(cmd.id);
          }}
          className={`flex w-full items-center gap-3 px-3 py-2 text-left text-sm transition-colors ${
            idx === activeIdx
              ? "bg-accent text-white"
              : "text-zinc-700 hover:bg-zinc-100"
          }`}
        >
          <span className="w-8 shrink-0 text-center font-mono text-xs">{cmd.icon}</span>
          <span>
            <span className="font-medium">{cmd.label}</span>
            <span
              className={`ml-2 text-xs ${
                idx === activeIdx ? "text-indigo-100" : "text-zinc-400"
              }`}
            >
              {cmd.description}
            </span>
          </span>
        </button>
      ))}
    </MenuContainer>
  );
}

function MenuContainer({ anchorRect, menuRef, children }) {
  // Position below caret, bounded to viewport
  const style = anchorRect
    ? {
        position: "fixed",
        top: Math.min(anchorRect.bottom + 4, window.innerHeight - 320),
        left: Math.min(anchorRect.left, window.innerWidth - 280),
        zIndex: 9999,
      }
    : { position: "fixed", top: 100, left: 100, zIndex: 9999 };

  return (
    <div
      ref={menuRef}
      style={style}
      className="w-64 overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-xl"
    >
      <div className="max-h-72 overflow-y-auto py-1">{children}</div>
    </div>
  );
}
