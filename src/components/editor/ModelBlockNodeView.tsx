"use client";

import { NodeViewWrapper } from "@tiptap/react";
import { useState } from "react";

interface ModelBlockAttrs {
  modelUrl: string;
  modelName: string;
  height: number;
}

export function ModelBlockNodeView({
  node,
  updateAttributes,
  deleteNode,
}: {
  node: { attrs: ModelBlockAttrs };
  updateAttributes: (attrs: Partial<ModelBlockAttrs>) => void;
  deleteNode: () => void;
}) {
  const [showSettings, setShowSettings] = useState(false);

  return (
    <NodeViewWrapper className="my-4">
      <div className="rounded-xl border-2 border-dashed border-blue-300 bg-blue-50 p-6">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100">
              <svg
                className="h-5 w-5 text-blue-600"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="m21 7.5-9-5.25L3 7.5m18 0-9 5.25m9-5.25v9l-9 5.25M3 7.5l9 5.25M3 7.5v9l9 5.25m0-9v9"
                />
              </svg>
            </div>
            <div>
              <p className="text-sm font-semibold text-blue-800">
                {node.attrs.modelName || "3D Model"}
              </p>
              <p className="mt-0.5 text-xs text-blue-500 truncate max-w-xs">
                {node.attrs.modelUrl
                  ? node.attrs.modelUrl.split("/").pop()
                  : "No model selected"}
              </p>
            </div>
          </div>
          <div className="flex gap-1.5">
            <button
              onClick={() => setShowSettings(!showSettings)}
              className="rounded-lg border border-blue-200 bg-white px-2.5 py-1 text-xs text-blue-600 hover:bg-blue-50"
            >
              {showSettings ? "Close" : "Settings"}
            </button>
            <button
              onClick={deleteNode}
              className="rounded-lg border border-red-200 bg-white px-2.5 py-1 text-xs text-red-500 hover:bg-red-50"
            >
              Remove
            </button>
          </div>
        </div>

        {/* Preview indicator */}
        <div className="mt-3 flex items-center justify-center rounded-lg bg-gradient-to-br from-gray-800 to-gray-900 py-8">
          <div className="text-center">
            <svg
              className="mx-auto h-8 w-8 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1}
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="m21 7.5-9-5.25L3 7.5m18 0-9 5.25m9-5.25v9l-9 5.25M3 7.5l9 5.25M3 7.5v9l9 5.25m0-9v9"
              />
            </svg>
            <p className="mt-2 text-xs text-gray-400">
              3D viewer will render here for visitors
            </p>
            <p className="mt-1 text-[10px] text-gray-500">
              Height: {node.attrs.height}px
            </p>
          </div>
        </div>

        {/* Settings panel */}
        {showSettings && (
          <div className="mt-3 space-y-3 rounded-lg border border-blue-100 bg-white p-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                Model URL
              </label>
              <input
                type="text"
                value={node.attrs.modelUrl}
                onChange={(e) => updateAttributes({ modelUrl: e.target.value })}
                placeholder="https://...blob.vercel-storage.com/models/file.glb"
                className="w-full rounded-md border border-gray-200 px-2.5 py-1.5 text-xs focus:border-blue-400 focus:outline-none focus:ring-1 focus:ring-blue-400"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                Display Name
              </label>
              <input
                type="text"
                value={node.attrs.modelName}
                onChange={(e) => updateAttributes({ modelName: e.target.value })}
                placeholder="e.g. Yale Keypad"
                className="w-full rounded-md border border-gray-200 px-2.5 py-1.5 text-xs focus:border-blue-400 focus:outline-none focus:ring-1 focus:ring-blue-400"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                Height (px)
              </label>
              <select
                value={node.attrs.height}
                onChange={(e) =>
                  updateAttributes({ height: parseInt(e.target.value, 10) })
                }
                className="w-full rounded-md border border-gray-200 px-2.5 py-1.5 text-xs focus:border-blue-400 focus:outline-none focus:ring-1 focus:ring-blue-400"
              >
                <option value={300}>Small (300px)</option>
                <option value={400}>Medium (400px)</option>
                <option value={500}>Large (500px)</option>
                <option value={600}>Extra Large (600px)</option>
              </select>
            </div>
          </div>
        )}
      </div>
    </NodeViewWrapper>
  );
}
