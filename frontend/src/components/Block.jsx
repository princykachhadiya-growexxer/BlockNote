"use client";

import { useEffect, useRef, useState } from "react";
import SlashMenu from "./SlashMenu";
import {
  escapeHtml,
  getEditorHtml,
  normalizeTextContent,
  sanitizeRichTextHtml,
} from "@/lib/rich-text";

const NON_EDITABLE_TYPES = new Set(["divider", "image"]);
const INLINE_FORMATTING_TYPES = new Set(["paragraph", "heading_1", "heading_2", "todo"]);

export default function Block({
  block,
  onFocus,
  onChange,
  onEnter,
  onBackspace,
  onConvert,
  registerRef,
}) {
  const editableRef = useRef(null);
  const [slashState, setSlashState] = useState(null);
  const [toolbarRect, setToolbarRect] = useState(null);
  const suppressNextInputSave = useRef(false);

  useEffect(() => {
    registerRef(block.id, editableRef);
    return () => registerRef(block.id, null);
  }, [block.id, registerRef]);

  useEffect(() => {
    const el = editableRef.current;
    if (!el || NON_EDITABLE_TYPES.has(block.type)) return;

    const nextHtml = block.type === "code"
      ? escapeHtml(block.content?.text ?? "").replaceAll("\n", "<br>")
      : getEditorHtml(block.content);

    if (document.activeElement === el) return;
    if (el.innerHTML !== nextHtml) {
      el.innerHTML = nextHtml;
    }
  }, [block.content, block.type]);

  useEffect(() => {
    if (!INLINE_FORMATTING_TYPES.has(block.type)) return undefined;

    function syncToolbar() {
      const el = editableRef.current;
      const selection = window.getSelection();
      if (!el || !selection?.rangeCount) {
        setToolbarRect(null);
        return;
      }

      const range = selection.getRangeAt(0);
      if (
        selection.isCollapsed ||
        !el.contains(range.commonAncestorContainer) ||
        (range.toString() ?? "").trim() === ""
      ) {
        setToolbarRect(null);
        return;
      }

      const rect = range.getBoundingClientRect();
      if (!rect.width && !rect.height) {
        setToolbarRect(null);
        return;
      }

      setToolbarRect({
        top: Math.max(12, rect.top + window.scrollY - 54),
        left: rect.left + window.scrollX + rect.width / 2,
      });
    }

    document.addEventListener("selectionchange", syncToolbar);
    window.addEventListener("scroll", syncToolbar, true);
    window.addEventListener("resize", syncToolbar);

    return () => {
      document.removeEventListener("selectionchange", syncToolbar);
      window.removeEventListener("scroll", syncToolbar, true);
      window.removeEventListener("resize", syncToolbar);
    };
  }, [block.type]);

  if (block.type === "divider") {
    return (
      <div className="group relative my-4 flex cursor-default items-center" onClick={onFocus}>
        <hr className="w-full border-zinc-300" />
      </div>
    );
  }

  if (block.type === "image") {
    return <ImageBlock block={block} onFocus={onFocus} onChange={onChange} />;
  }

  function getCaretRect() {
    const selection = window.getSelection();
    if (!selection?.rangeCount) return null;
    return selection.getRangeAt(0).getBoundingClientRect();
  }

  function syncContentFromDom() {
    const el = editableRef.current;
    if (!el) return normalizeTextContent(block.content);

    if (block.type === "code") {
      return {
        ...block.content,
        text: el.textContent ?? "",
        html: "",
      };
    }

    return normalizeTextContent({
      ...block.content,
      html: sanitizeRichTextHtml(el.innerHTML),
    });
  }

  function closeSlash(removeText = true) {
    if (!removeText) {
      setSlashState(null);
      return;
    }

    const el = editableRef.current;
    if (!el) return;

    const text = el.textContent ?? "";
    const slashIdx = text.lastIndexOf("/");
    if (slashIdx === -1) {
      setSlashState(null);
      return;
    }

    const newText = text.slice(0, slashIdx);
    if (block.type === "code") {
      el.textContent = newText;
    } else {
      el.innerHTML = newText ? escapeHtml(newText).replace(/\n/g, "<br>") : "";
    }

    placeCaretAtEnd(el);
    suppressNextInputSave.current = true;
    onChange(block.id, {
      content: normalizeTextContent({ ...block.content, html: el.innerHTML, text: newText }),
    });
    setSlashState(null);
  }

  function handleSlashSelect(commandId) {
    closeSlash(true);
    if (commandId !== block.type) {
      onConvert(block.id, commandId);
    }
  }

  function buildSplitPayload() {
    const el = editableRef.current;
    const selection = window.getSelection();
    if (!el || !selection?.rangeCount) return null;

    const range = selection.getRangeAt(0);

    if (block.type === "code") {
      const text = el.textContent ?? "";
      const caretOffset = range.startOffset ?? text.length;
      return {
        atStart: caretOffset === 0,
        atEnd: caretOffset >= text.length,
        leftContent: { text: text.slice(0, caretOffset), html: "" },
        rightContent: { text: text.slice(caretOffset), html: "" },
      };
    }

    const beforeRange = range.cloneRange();
    beforeRange.selectNodeContents(el);
    beforeRange.setEnd(range.startContainer, range.startOffset);

    const afterRange = range.cloneRange();
    afterRange.selectNodeContents(el);
    afterRange.setStart(range.startContainer, range.startOffset);

    const beforeContainer = document.createElement("div");
    beforeContainer.appendChild(beforeRange.cloneContents());
    const afterContainer = document.createElement("div");
    afterContainer.appendChild(afterRange.cloneContents());

    const leftContent = normalizeTextContent({
      ...block.content,
      html: sanitizeRichTextHtml(beforeContainer.innerHTML),
    });
    const rightContent = normalizeTextContent({
      ...block.content,
      html: sanitizeRichTextHtml(afterContainer.innerHTML),
      checked: block.content?.checked ?? false,
    });

    const fullText = el.textContent ?? "";
    const leftText = leftContent.text ?? "";

    return {
      atStart: leftText.length === 0,
      atEnd: leftText.length >= fullText.length,
      leftContent,
      rightContent,
    };
  }

  function handleKeyDown(e) {
    const el = editableRef.current;
    if (!el) return;

    if (slashState && ["ArrowUp", "ArrowDown", "Enter", "Escape"].includes(e.key)) {
      return;
    }

    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      const payload = buildSplitPayload();
      if (payload) {
        onEnter(block.id, payload);
      }
      return;
    }

    if (e.key === "Backspace") {
      const selection = window.getSelection();
      const range = selection?.rangeCount ? selection.getRangeAt(0) : null;
      const atStart = range ? range.collapsed && isAtStartOfElement(el, range) : true;

      if (atStart) {
        e.preventDefault();
        onBackspace(block.id);
        return;
      }

      if (slashState) {
        const afterBackspace = (el.textContent ?? "").slice(0, Math.max((range?.startOffset ?? 1) - 1, 0));
        if (!afterBackspace.includes("/")) {
          setSlashState(null);
        }
      }
      return;
    }

    if (e.key === "Tab" && block.type === "code") {
      e.preventDefault();
      document.execCommand("insertText", false, "  ");
      return;
    }

    if (e.key === "Escape" && slashState) {
      e.preventDefault();
      closeSlash(true);
    }
  }

  function handleInput(e) {
    if (suppressNextInputSave.current) {
      suppressNextInputSave.current = false;
      return;
    }

    const text = e.currentTarget.textContent ?? "";
    const selection = window.getSelection();
    const caretOffset = selection?.rangeCount ? selection.getRangeAt(0).startOffset : 0;
    const upToCaret = text.slice(0, caretOffset);
    const slashIdx = upToCaret.lastIndexOf("/");

    if (slashIdx === 0) {
      setSlashState({ query: upToCaret.slice(1), rect: getCaretRect() });
      return;
    }

    const content = block.type === "code"
      ? { ...block.content, text: e.currentTarget.textContent ?? "", html: "" }
      : normalizeTextContent({ ...block.content, html: e.currentTarget.innerHTML });

    onChange(block.id, { content });

    if (slashState) {
      setSlashState(null);
    }
  }

  function handleTodoCheck(e) {
    onChange(block.id, {
      content: {
        ...syncContentFromDom(),
        checked: e.target.checked,
      },
    });
  }

  function applyInlineCommand(command) {
    const el = editableRef.current;
    if (!el) return;
    el.focus();
    document.execCommand(command, false);
    onChange(block.id, { content: syncContentFromDom() });
  }

  const placeholder = getPlaceholder(block.type);
  const editableClass = getEditableClass(block.type);

  return (
    <div className="group relative flex items-start gap-2">
      {block.type === "todo" && (
        <input
          type="checkbox"
          checked={!!block.content?.checked}
          onChange={handleTodoCheck}
          className="mt-1 h-4 w-4 shrink-0 cursor-pointer rounded border-zinc-300 text-accent focus:ring-accent"
        />
      )}

      <div
        ref={editableRef}
        contentEditable
        suppressContentEditableWarning
        spellCheck
        onFocus={onFocus}
        onKeyDown={handleKeyDown}
        onInput={handleInput}
        data-block-id={block.id}
        data-placeholder={placeholder}
        className={`${editableClass} relative min-h-[1.5em] w-full outline-none`}
      />

      {toolbarRect && (
        <FloatingToolbar
          top={toolbarRect.top}
          left={toolbarRect.left}
          blockType={block.type}
          onBold={() => applyInlineCommand("bold")}
          onItalic={() => applyInlineCommand("italic")}
          onConvert={(type) => onConvert(block.id, type)}
        />
      )}

      {slashState && (
        <SlashMenu
          query={slashState.query}
          anchorRect={slashState.rect}
          onSelect={handleSlashSelect}
          onClose={() => closeSlash(true)}
        />
      )}
    </div>
  );
}

function FloatingToolbar({ top, left, blockType, onBold, onItalic, onConvert }) {
  return (
    <div
      className="fixed z-50 flex -translate-x-1/2 items-center gap-1 rounded-2xl border border-[#1A1A1A]/10 bg-white/95 p-1.5 shadow-[0_14px_40px_rgba(60,72,105,0.16)] backdrop-blur"
      style={{ top, left }}
    >
      <ToolbarButton label="B" onMouseDown={preventBlur} onClick={onBold} />
      <ToolbarButton label="I" onMouseDown={preventBlur} onClick={onItalic} />
      <div className="mx-1 h-5 w-px bg-zinc-200" />
      <ToolbarButton
        label="Text"
        active={blockType === "paragraph"}
        onMouseDown={preventBlur}
        onClick={() => onConvert("paragraph")}
      />
      <ToolbarButton
        label="H1"
        active={blockType === "heading_1"}
        onMouseDown={preventBlur}
        onClick={() => onConvert("heading_1")}
      />
      <ToolbarButton
        label="H2"
        active={blockType === "heading_2"}
        onMouseDown={preventBlur}
        onClick={() => onConvert("heading_2")}
      />
    </div>
  );
}

function ToolbarButton({ active = false, label, ...props }) {
  return (
    <button
      type="button"
      className={`rounded-xl px-2.5 py-1 text-xs font-semibold transition ${
        active
          ? "bg-[#B7BCE8] text-[#1A1A1A]"
          : "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900"
      }`}
      {...props}
    >
      {label}
    </button>
  );
}

function ImageBlock({ block, onFocus, onChange }) {
  const [editing, setEditing] = useState(!block.content?.url);
  const [urlInput, setUrlInput] = useState(block.content?.url ?? "");
  const [imageFailed, setImageFailed] = useState(false);

  useEffect(() => {
    setUrlInput(block.content?.url ?? "");
    setEditing(!block.content?.url);
    setImageFailed(false);
  }, [block.content?.url]);

  function commit() {
    const url = urlInput.trim();
    if (url) {
      onChange(block.id, { content: { ...block.content, url } });
      setEditing(false);
    }
  }

  if (editing) {
    return (
      <div className="flex items-center gap-2 rounded-lg border border-zinc-200 bg-zinc-50 p-3">
        <span className="text-xs text-zinc-500">Image URL:</span>
        <input
          autoFocus
          type="url"
          value={urlInput}
          onChange={(e) => setUrlInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              commit();
            }
            if (e.key === "Escape") setEditing(false);
          }}
          placeholder="https://example.com/image.png"
          className="flex-1 rounded border border-zinc-300 px-2 py-1 text-sm outline-none focus:ring-2 focus:ring-accent"
        />
        <button
          type="button"
          onClick={commit}
          className="rounded bg-accent px-2 py-1 text-xs font-medium text-white hover:bg-accent-hover"
        >
          Embed
        </button>
      </div>
    );
  }

  return (
    <div className="relative" onClick={onFocus}>
      {!block.content?.url || imageFailed ? (
        <div className="flex min-h-48 w-full items-center justify-center rounded-2xl border border-dashed border-zinc-300 bg-zinc-50 px-4 text-sm text-zinc-500">
          {block.content?.url ? "Image could not be loaded." : "Add an image URL to display this block."}
        </div>
      ) : (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={block.content?.url}
          alt={block.content?.alt ?? ""}
          className="max-h-96 w-full rounded-2xl border border-zinc-200 bg-white object-contain"
          onError={() => {
            setImageFailed(true);
          }}
        />
      )}
      <button
        type="button"
        onClick={() => setEditing(true)}
        className="absolute right-2 top-2 rounded bg-black/40 px-2 py-0.5 text-xs text-white opacity-0 transition-opacity group-hover:opacity-100"
      >
        Edit URL
      </button>
    </div>
  );
}

function preventBlur(e) {
  e.preventDefault();
}

function placeCaretAtEnd(el) {
  const selection = window.getSelection();
  const range = document.createRange();
  range.selectNodeContents(el);
  range.collapse(false);
  selection?.removeAllRanges();
  selection?.addRange(range);
}

function isAtStartOfElement(el, range) {
  const probe = range.cloneRange();
  probe.selectNodeContents(el);
  probe.setEnd(range.startContainer, range.startOffset);
  return (probe.toString() ?? "") === "";
}

function getPlaceholder(type) {
  switch (type) {
    case "heading_1":
      return "Heading 1";
    case "heading_2":
      return "Heading 2";
    case "todo":
      return "To-do";
    case "code":
      return "Code…";
    default:
      return "Type '/' for commands…";
  }
}

function getEditableClass(type) {
  const base = "break-words";
  switch (type) {
    case "heading_1":
      return `${base} text-3xl font-bold text-zinc-900 leading-tight`;
    case "heading_2":
      return `${base} text-xl font-semibold text-zinc-800 leading-snug`;
    case "todo":
      return `${base} text-sm text-zinc-700`;
    case "code":
      return `${base} rounded-md bg-zinc-100 px-3 py-2 font-mono text-sm text-zinc-800 whitespace-pre-wrap`;
    default:
      return `${base} text-sm text-zinc-700 leading-relaxed`;
  }
}
