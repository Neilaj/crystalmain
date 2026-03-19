"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import Link from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import CodeBlock from "@tiptap/extension-code-block";
import { ContactFormBlock } from "./FormBlockExtension";
import { ColumnLayout, Column } from "./ColumnExtension";
import { EditorToolbar } from "./EditorToolbar";

interface EditorProps {
  content: Record<string, unknown> | null;
  onChange: (content: Record<string, unknown>) => void;
  onEditorReady?: (editor: ReturnType<typeof useEditor>) => void;
}

export default function Editor({ content, onChange, onEditorReady }: EditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3, 4],
        },
        codeBlock: false,
      }),
      CodeBlock.configure({
        HTMLAttributes: {
          class: "bg-gray-900 text-gray-100 rounded-lg p-4 font-mono text-sm",
        },
      }),
      Image.configure({
        HTMLAttributes: {
          class: "rounded-lg max-w-full h-auto",
        },
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: "text-green-600 underline hover:text-green-700",
        },
      }),
      Placeholder.configure({
        placeholder: "Start writing your content...",
      }),
      ContactFormBlock,
      ColumnLayout,
      Column,
    ],
    immediatelyRender: false,
    content: content || undefined,
    onUpdate: ({ editor }) => {
      onChange(editor.getJSON() as Record<string, unknown>);
    },
    editorProps: {
      attributes: {
        class:
          "prose prose-lg max-w-none min-h-[400px] focus:outline-none px-6 py-4",
      },
    },
  });

  // Notify parent when editor is ready
  if (editor && onEditorReady) {
    onEditorReady(editor);
  }

  if (!editor) return null;

  return (
    <div className="rounded-xl border border-gray-200 bg-white">
      <EditorToolbar editor={editor} />
      <EditorContent editor={editor} />
    </div>
  );
}
