export const SLASH_COMMANDS = [
  {
    id: "paragraph",
    label: "Paragraph",
    description: "Plain text",
    keywords: ["paragraph", "text", "p"],
    icon: "¶",
  },
  {
    id: "heading_1",
    label: "Heading 1",
    description: "Large section heading",
    keywords: ["heading", "heading1", "h1", "title"],
    icon: "H1",
  },
  {
    id: "heading_2",
    label: "Heading 2",
    description: "Medium section heading",
    keywords: ["heading", "heading2", "h2", "subtitle"],
    icon: "H2",
  },
  {
    id: "todo",
    label: "To-do",
    description: "Checkbox task",
    keywords: ["todo", "task", "checkbox", "check"],
    icon: "☑",
  },
  {
    id: "code",
    label: "Code",
    description: "Monospace code block",
    keywords: ["code", "codeblock", "snippet", "pre"],
    icon: "</>",
  },
  {
    id: "divider",
    label: "Divider",
    description: "Horizontal rule",
    keywords: ["divider", "separator", "hr", "rule", "line"],
    icon: "—",
  },
  {
    id: "image",
    label: "Image",
    description: "Embed an image by URL",
    keywords: ["image", "img", "photo", "picture", "url"],
    icon: "🖼",
  },
];

/**
 * Filter commands by the text typed after "/"
 */
export function filterCommands(query) {
  if (!query) return SLASH_COMMANDS;
  const q = query.toLowerCase();
  return SLASH_COMMANDS.filter(
    (cmd) =>
      cmd.label.toLowerCase().includes(q) ||
      cmd.keywords.some((k) => k.includes(q))
  );
}
