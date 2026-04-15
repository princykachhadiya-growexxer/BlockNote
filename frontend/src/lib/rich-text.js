const INLINE_TAGS = new Set(["B", "STRONG", "I", "EM", "BR"]);
const BLOCK_TAGS = new Set(["DIV", "P"]);

export function escapeHtml(value = "") {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

export function sanitizeRichTextHtml(html = "") {
  if (typeof window === "undefined") {
    return html || "";
  }

  const parser = new DOMParser();
  const doc = parser.parseFromString(`<div>${html || ""}</div>`, "text/html");
  const root = doc.body.firstElementChild;

  if (!root) return "";

  function cleanNode(node) {
    if (node.nodeType === Node.TEXT_NODE) {
      return doc.createTextNode(node.textContent ?? "");
    }

    if (node.nodeType !== Node.ELEMENT_NODE) {
      return null;
    }

    const tagName = node.tagName.toUpperCase();
    if (!INLINE_TAGS.has(tagName) && !BLOCK_TAGS.has(tagName)) {
      const fragment = doc.createDocumentFragment();
      for (const child of node.childNodes) {
        const cleaned = cleanNode(child);
        if (cleaned) fragment.appendChild(cleaned);
      }
      return fragment;
    }

    const safeTag = tagName === "DIV" ? "P" : tagName.toLowerCase();
    const el = doc.createElement(safeTag);
    for (const child of node.childNodes) {
      const cleaned = cleanNode(child);
      if (cleaned) el.appendChild(cleaned);
    }
    return el;
  }

  const cleanedRoot = doc.createElement("div");
  for (const child of root.childNodes) {
    const cleaned = cleanNode(child);
    if (cleaned) cleanedRoot.appendChild(cleaned);
  }

  return cleanedRoot.innerHTML
    .replace(/<p><\/p>/gi, "")
    .replace(/<p><br><\/p>/gi, "")
    .trim();
}

export function htmlToPlainText(html = "") {
  if (!html) return "";

  if (typeof window === "undefined") {
    return html
      .replace(/<br\s*\/?>/gi, "\n")
      .replace(/<\/p>/gi, "\n")
      .replace(/<[^>]+>/g, "")
      .trimEnd();
  }

  const parser = new DOMParser();
  const doc = parser.parseFromString(`<div>${html}</div>`, "text/html");
  return (doc.body.textContent ?? "").replace(/\u00a0/g, " ").trimEnd();
}

export function normalizeTextContent(content = {}) {
  const html = sanitizeRichTextHtml(content.html ?? "");
  const text = html ? htmlToPlainText(html) : String(content.text ?? "");
  return {
    ...content,
    html,
    text,
  };
}

export function getEditorHtml(content = {}) {
  const html = sanitizeRichTextHtml(content.html ?? "");
  if (html) return html;
  return escapeHtml(content.text ?? "").replace(/\n/g, "<br>");
}

export function isBlockEmpty(content = {}) {
  return htmlToPlainText(content.html ?? "").trim() === "" && String(content.text ?? "").trim() === "";
}

export function mergeBlockContent(previous = {}, current = {}) {
  const mergedHtml = sanitizeRichTextHtml(
    `${getEditorHtml(previous)}${getEditorHtml(current)}`
  );

  return {
    ...previous,
    ...current,
    checked: current.checked ?? previous.checked,
    html: mergedHtml,
    text: htmlToPlainText(mergedHtml),
  };
}
