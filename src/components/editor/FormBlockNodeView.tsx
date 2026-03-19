"use client";

import { NodeViewWrapper } from "@tiptap/react";

export function FormBlockNodeView({ node, deleteNode }: { node: { attrs: { formSlug: string; formName: string } }; deleteNode: () => void }) {
  return (
    <NodeViewWrapper className="my-4">
      <div className="rounded-xl border-2 border-dashed border-green-300 bg-green-50 p-6 text-center">
        <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-green-100">
          <svg className="h-5 w-5 text-green-600" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75" />
          </svg>
        </div>
        <p className="text-sm font-semibold text-green-800">
          {node.attrs.formName || "Contact Form"}
        </p>
        <p className="mt-1 text-xs text-green-600">
          /form/{node.attrs.formSlug}
        </p>
        <p className="mt-2 text-xs text-green-500">
          This form will be rendered for visitors
        </p>
        <button
          onClick={deleteNode}
          className="mt-3 rounded-lg border border-red-200 bg-white px-3 py-1 text-xs text-red-500 hover:bg-red-50"
        >
          Remove Form
        </button>
      </div>
    </NodeViewWrapper>
  );
}
