import { Node, mergeAttributes } from "@tiptap/core";
import { ReactNodeViewRenderer, NodeViewWrapper, NodeViewContent } from "@tiptap/react";

// ─── Column Layout Node ───────────────────────────────
// Wraps multiple Column nodes in a grid layout

export const ColumnLayout = Node.create({
  name: "columnLayout",
  group: "block",
  content: "column+",
  defining: true,

  addAttributes() {
    return {
      columns: {
        default: 2,
        parseHTML: (element) => parseInt(element.getAttribute("data-columns") || "2"),
      },
      layout: {
        default: "equal",
        parseHTML: (element) => element.getAttribute("data-layout") || "equal",
      },
    };
  },

  parseHTML() {
    return [{ tag: "div[data-type='column-layout']" }];
  },

  renderHTML({ HTMLAttributes }) {
    const cols = HTMLAttributes.columns || 2;
    const layout = HTMLAttributes.layout || "equal";

    let gridClass = "grid gap-6 ";
    if (layout === "70-30") {
      gridClass += "grid-cols-1 md:grid-cols-[2fr_1fr]";
    } else if (layout === "30-70") {
      gridClass += "grid-cols-1 md:grid-cols-[1fr_2fr]";
    } else {
      gridClass += `grid-cols-1 md:grid-cols-${cols}`;
    }

    return [
      "div",
      mergeAttributes(HTMLAttributes, {
        "data-type": "column-layout",
        "data-columns": cols,
        "data-layout": layout,
        class: gridClass,
        style: `display: grid; gap: 1.5rem; grid-template-columns: repeat(${cols}, 1fr);`,
      }),
      0,
    ];
  },
});

// ─── Column Node ──────────────────────────────────────
// Individual column that holds block content

export const Column = Node.create({
  name: "column",
  group: "",
  content: "block+",
  defining: true,
  isolating: true,

  parseHTML() {
    return [{ tag: "div[data-type='column']" }];
  },

  renderHTML({ HTMLAttributes }) {
    return [
      "div",
      mergeAttributes(HTMLAttributes, {
        "data-type": "column",
        class: "column-content",
        style: "min-height: 2rem;",
      }),
      0,
    ];
  },

  addNodeView() {
    return ReactNodeViewRenderer(ColumnView);
  },
});

// ─── Column React View ────────────────────────────────

function ColumnView() {
  return (
    <NodeViewWrapper
      className="rounded-lg border border-dashed border-gray-300 bg-gray-50/50 p-3 min-h-[60px]"
      data-type="column"
    >
      <NodeViewContent className="column-content" />
    </NodeViewWrapper>
  );
}

// ─── Helper: Insert Column Layout ─────────────────────

export function insertColumnLayout(
  editor: { chain: () => { focus: () => { insertContent: (content: unknown) => { run: () => void } } } },
  columns: number,
  layout: string = "equal"
) {
  const columnContent = Array.from({ length: columns }, () => ({
    type: "column",
    content: [
      {
        type: "paragraph",
        content: [{ type: "text", text: "Column content..." }],
      },
    ],
  }));

  editor
    .chain()
    .focus()
    .insertContent({
      type: "columnLayout",
      attrs: { columns, layout },
      content: columnContent,
    })
    .run();
}
