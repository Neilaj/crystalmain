"use client";

import { Node, mergeAttributes } from "@tiptap/core";
import { ReactNodeViewRenderer, NodeViewWrapper, type NodeViewProps } from "@tiptap/react";
import { useState } from "react";

// Custom Image extension with size and alignment controls
export const ResizableImage = Node.create({
  name: "image",
  group: "block",
  atom: true,
  draggable: true,

  addAttributes() {
    return {
      src: { default: null },
      alt: { default: "" },
      title: { default: "" },
      width: { default: "100" }, // percentage: "25", "50", "75", "100"
      alignment: { default: "center" }, // "left", "center", "right"
    };
  },

  parseHTML() {
    return [
      {
        tag: "img[src]",
        getAttrs: (dom) => {
          if (typeof dom === "string") return false;
          return {
            src: dom.getAttribute("src"),
            alt: dom.getAttribute("alt") || "",
            title: dom.getAttribute("title") || "",
            width: dom.getAttribute("data-width") || "100",
            alignment: dom.getAttribute("data-alignment") || "center",
          };
        },
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    const { width, alignment, ...rest } = HTMLAttributes;
    return [
      "img",
      mergeAttributes(rest, {
        "data-width": width,
        "data-alignment": alignment,
        class: "rounded-lg h-auto",
        loading: "lazy",
      }),
    ];
  },

  addNodeView() {
    return ReactNodeViewRenderer(ImageNodeView);
  },
});

// Size options
const SIZE_OPTIONS = [
  { value: "25", label: "25%" },
  { value: "50", label: "50%" },
  { value: "75", label: "75%" },
  { value: "100", label: "100%" },
];

// Alignment options
const ALIGN_OPTIONS = [
  {
    value: "left",
    label: "Left",
    icon: (
      <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h10.5m-10.5 5.25h16.5" />
      </svg>
    ),
  },
  {
    value: "center",
    label: "Center",
    icon: (
      <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M6.75 12h10.5M3.75 17.25h16.5" />
      </svg>
    ),
  },
  {
    value: "right",
    label: "Right",
    icon: (
      <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M10.5 12h10.5M3.75 17.25h16.5" />
      </svg>
    ),
  },
];

function ImageNodeView(props: NodeViewProps) {
  const { node, updateAttributes, selected } = props;
  const [showControls, setShowControls] = useState(false);
  const src = node.attrs.src as string;
  const alt = node.attrs.alt as string;
  const title = node.attrs.title as string;
  const width = node.attrs.width as string;
  const alignment = node.attrs.alignment as string;

  const justifyClass =
    alignment === "left"
      ? "justify-start"
      : alignment === "right"
      ? "justify-end"
      : "justify-center";

  return (
    <NodeViewWrapper className="my-2" data-drag-handle="">
      {/* Controls toolbar — rendered above image */}
      {(selected || showControls) && (
        <div className={`flex ${justifyClass} mb-2`}>
          <div className="flex items-center gap-1 rounded-lg border border-gray-200 bg-white px-2 py-1.5 shadow-lg">
            {/* Size buttons */}
            {SIZE_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                onClick={(e) => {
                  e.stopPropagation();
                  updateAttributes({ width: opt.value });
                }}
                className={`rounded px-1.5 py-0.5 text-[10px] font-medium transition-colors ${
                  width === opt.value
                    ? "bg-green-100 text-green-700"
                    : "text-gray-500 hover:bg-gray-100"
                }`}
                title={`Set width to ${opt.label}`}
              >
                {opt.label}
              </button>
            ))}

            <div className="mx-1 h-4 w-px bg-gray-200" />

            {/* Alignment buttons */}
            {ALIGN_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                onClick={(e) => {
                  e.stopPropagation();
                  updateAttributes({ alignment: opt.value });
                }}
                className={`rounded p-1 transition-colors ${
                  alignment === opt.value
                    ? "bg-green-100 text-green-700"
                    : "text-gray-500 hover:bg-gray-100"
                }`}
                title={opt.label}
              >
                {opt.icon}
              </button>
            ))}
          </div>
        </div>
      )}

      <div
        className={`flex ${justifyClass}`}
        onClick={() => setShowControls(!showControls)}
      >
        <div
          className={`relative inline-block transition-all ${
            selected || showControls
              ? "ring-2 ring-green-500 ring-offset-2 rounded-lg"
              : ""
          }`}
          style={{ width: `${width}%` }}
        >
          <img
            src={src}
            alt={alt}
            title={title}
            className="rounded-lg w-full h-auto cursor-pointer"
          />
        </div>
      </div>

      {/* Alt text indicator */}
      {(selected || showControls) && (
        <div className={`flex ${justifyClass} mt-1`}>
          <p className="text-[10px] text-gray-400" style={{ width: `${width}%` }}>
            {alt ? (
              <span className="text-green-500">✓ Alt: {alt}</span>
            ) : (
              <span className="text-amber-500">⚠ No alt text</span>
            )}
            {title && <span className="ml-2 text-gray-400">| Title: {title}</span>}
          </p>
        </div>
      )}
    </NodeViewWrapper>
  );
}
