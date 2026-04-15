const ALLOWED_TAGS = new Set(["b", "strong", "i", "em", "br", "p"]);
const TEXT_BLOCK_TYPES = new Set(["paragraph", "heading_1", "heading_2", "todo"]);

function stripDisallowedTags(html = "") {
  return String(html)
    .replace(/<\s*\/?\s*([a-z0-9-]+)([^>]*)>/gi, (match, tagName) => {
      const tag = tagName.toLowerCase();
      if (ALLOWED_TAGS.has(tag)) {
        return match
          .replace(/\son[a-z]+\s*=\s*(['"]).*?\1/gi, "")
          .replace(/\son[a-z]+\s*=\s*[^\s>]+/gi, "")
          .replace(/\sstyle\s*=\s*(['"]).*?\1/gi, "");
      }
      return "";
    })
    .replace(/javascript:/gi, "");
}

export function sanitizeRichTextHtml(html = "") {
  return stripDisallowedTags(html)
    .replace(/<p><\/p>/gi, "")
    .replace(/<p><br><\/p>/gi, "")
    .trim();
}

export function htmlToPlainText(html = "") {
  return String(html)
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/p>/gi, "\n")
    .replace(/<p>/gi, "")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&#39;/gi, "'")
    .replace(/&quot;/gi, '"')
    .trimEnd();
}

export function normalizeBlockContent(type, content = {}) {
  if (!TEXT_BLOCK_TYPES.has(type)) {
    return content ?? {};
  }

  const html = sanitizeRichTextHtml(content.html ?? "");
  const text = html ? htmlToPlainText(html) : String(content.text ?? "");

  return {
    ...content,
    html,
    text,
  };
}

export function isTextBlockType(type) {
  return TEXT_BLOCK_TYPES.has(type);
}
