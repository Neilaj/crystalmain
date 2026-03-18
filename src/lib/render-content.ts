// Renders Tiptap JSON to semantic HTML string

interface TiptapNode {
  type: string;
  attrs?: Record<string, unknown>;
  content?: TiptapNode[];
  text?: string;
  marks?: { type: string; attrs?: Record<string, unknown> }[];
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function renderMarks(node: TiptapNode): string {
  let text = escapeHtml(node.text || "");
  if (!node.marks) return text;

  for (const mark of node.marks) {
    switch (mark.type) {
      case "bold":
        text = `<strong>${text}</strong>`;
        break;
      case "italic":
        text = `<em>${text}</em>`;
        break;
      case "strike":
        text = `<del>${text}</del>`;
        break;
      case "code":
        text = `<code>${text}</code>`;
        break;
      case "link":
        text = `<a href="${escapeHtml(String(mark.attrs?.href || ""))}">${text}</a>`;
        break;
    }
  }
  return text;
}

function renderNode(node: TiptapNode): string {
  if (node.type === "text") {
    return renderMarks(node);
  }

  const children = node.content?.map(renderNode).join("") || "";

  switch (node.type) {
    case "doc":
      return children;
    case "paragraph":
      return `<p>${children}</p>`;
    case "heading": {
      const level = node.attrs?.level || 2;
      return `<h${level}>${children}</h${level}>`;
    }
    case "bulletList":
      return `<ul>${children}</ul>`;
    case "orderedList":
      return `<ol>${children}</ol>`;
    case "listItem":
      return `<li>${children}</li>`;
    case "blockquote":
      return `<blockquote>${children}</blockquote>`;
    case "codeBlock":
      return `<pre><code>${children}</code></pre>`;
    case "horizontalRule":
      return `<hr />`;
    case "image":
      return `<img src="${escapeHtml(String(node.attrs?.src || ""))}" alt="${escapeHtml(String(node.attrs?.alt || ""))}" loading="lazy" />`;
    case "hardBreak":
      return `<br />`;
    default:
      return children;
  }
}

export function renderContent(content: unknown): string {
  if (!content || typeof content !== "object") return "";
  return renderNode(content as TiptapNode);
}

// Extract plain text from Tiptap JSON (for excerpts, meta descriptions)
export function extractText(content: unknown, maxLength?: number): string {
  if (!content || typeof content !== "object") return "";

  function walk(node: TiptapNode): string {
    if (node.type === "text") return node.text || "";
    return node.content?.map(walk).join(" ") || "";
  }

  const text = walk(content as TiptapNode).replace(/\s+/g, " ").trim();
  if (maxLength && text.length > maxLength) {
    return text.slice(0, maxLength).trim() + "...";
  }
  return text;
}
