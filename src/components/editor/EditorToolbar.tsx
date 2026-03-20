"use client";

import { Editor } from "@tiptap/react";
import { useCallback, useState, useEffect } from "react";
import { insertColumnLayout } from "./ColumnExtension";
import { ImagePicker } from "./ImagePicker";

interface ToolbarProps {
  editor: Editor;
}

function ToolbarButton({
  active,
  onClick,
  title,
  children,
}: {
  active?: boolean;
  onClick: () => void;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      className={`rounded p-1.5 transition-colors ${
        active
          ? "bg-green-100 text-green-700"
          : "text-gray-500 hover:bg-gray-100 hover:text-gray-700"
      }`}
    >
      {children}
    </button>
  );
}

function Divider() {
  return <div className="mx-1 h-6 w-px bg-gray-200" />;
}

export function EditorToolbar({ editor }: ToolbarProps) {
  const [forms, setForms] = useState<Array<{ id: string; name: string; slug: string }>>([]);
  const [showFormPicker, setShowFormPicker] = useState(false);
  const [showModelPicker, setShowModelPicker] = useState(false);
  const [models, setModels] = useState<Array<{ url: string; pathname: string; size: number }>>([]);
  const [uploading, setUploading] = useState(false);
  const [showImagePicker, setShowImagePicker] = useState(false);

  useEffect(() => {
    fetch("/api/forms")
      .then((r) => r.json())
      .then((data) => { if (Array.isArray(data)) setForms(data); })
      .catch(() => {});
  }, []);

  const fetchModels = useCallback(() => {
    fetch("/api/models/upload")
      .then((r) => r.json())
      .then((data) => { if (Array.isArray(data)) setModels(data); })
      .catch(() => {});
  }, []);

  const insertModel = useCallback((url: string, name: string) => {
    editor.chain().focus().insertContent({
      type: "modelBlock",
      attrs: { modelUrl: url, modelName: name, height: 400 },
    }).run();
    setShowModelPicker(false);
  }, [editor]);

  const uploadModel = useCallback(async (file: File) => {
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/models/upload", { method: "POST", body: formData });
      if (res.ok) {
        const data = await res.json();
        insertModel(data.url, data.name || file.name);
        fetchModels();
      } else {
        const err = await res.json();
        alert(err.error || "Upload failed");
      }
    } catch {
      alert("Upload failed");
    } finally {
      setUploading(false);
    }
  }, [insertModel, fetchModels]);

  const insertForm = useCallback((slug: string, name: string) => {
    editor.chain().focus().insertContent({
      type: "contactForm",
      attrs: { formSlug: slug, formName: name },
    }).run();
    setShowFormPicker(false);
  }, [editor]);

  const addImage = useCallback((url: string, alt?: string) => {
    editor.chain().focus().setImage({ src: url, alt: alt || "" }).run();
    setShowImagePicker(false);
  }, [editor]);

  const addLink = useCallback(() => {
    const url = window.prompt("Enter URL:");
    if (url) {
      editor.chain().focus().setLink({ href: url }).run();
    }
  }, [editor]);

  return (
    <div className="flex flex-wrap items-center gap-0.5 border-b border-gray-200 bg-gray-50 px-3 py-2">
      {/* Headings */}
      <ToolbarButton
        active={editor.isActive("heading", { level: 1 })}
        onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
        title="Heading 1"
      >
        <span className="text-xs font-bold">H1</span>
      </ToolbarButton>
      <ToolbarButton
        active={editor.isActive("heading", { level: 2 })}
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        title="Heading 2"
      >
        <span className="text-xs font-bold">H2</span>
      </ToolbarButton>
      <ToolbarButton
        active={editor.isActive("heading", { level: 3 })}
        onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
        title="Heading 3"
      >
        <span className="text-xs font-bold">H3</span>
      </ToolbarButton>
      <ToolbarButton
        active={editor.isActive("paragraph")}
        onClick={() => editor.chain().focus().setParagraph().run()}
        title="Paragraph"
      >
        <span className="text-xs font-medium">P</span>
      </ToolbarButton>

      <Divider />

      {/* Formatting */}
      <ToolbarButton
        active={editor.isActive("bold")}
        onClick={() => editor.chain().focus().toggleBold().run()}
        title="Bold (Ctrl+B)"
      >
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 4h8a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6V4Zm0 8h9a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6v-8Z" />
        </svg>
      </ToolbarButton>
      <ToolbarButton
        active={editor.isActive("italic")}
        onClick={() => editor.chain().focus().toggleItalic().run()}
        title="Italic (Ctrl+I)"
      >
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M10 4h4m-2 0 -4 16m-2 0h4" />
        </svg>
      </ToolbarButton>
      <ToolbarButton
        active={editor.isActive("strike")}
        onClick={() => editor.chain().focus().toggleStrike().run()}
        title="Strikethrough"
      >
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 12H4m16 0h-4M9 4v3.5M15 4v3.5M9 20v-3.5M15 20v-3.5" />
        </svg>
      </ToolbarButton>
      <ToolbarButton
        active={editor.isActive("code")}
        onClick={() => editor.chain().focus().toggleCode().run()}
        title="Inline Code"
      >
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="m17.25 6.75 4.5 5.25-4.5 5.25m-10.5 0L2.25 12l4.5-5.25m7.5-3-4.5 16.5" />
        </svg>
      </ToolbarButton>

      <Divider />

      {/* Lists */}
      <ToolbarButton
        active={editor.isActive("bulletList")}
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        title="Bullet List"
      >
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 6.75h12M8.25 12h12m-12 5.25h12M3.75 6.75h.007v.008H3.75V6.75Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0ZM3.75 12h.007v.008H3.75V12Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm-.375 5.25h.007v.008H3.75v-.008Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
        </svg>
      </ToolbarButton>
      <ToolbarButton
        active={editor.isActive("orderedList")}
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        title="Numbered List"
      >
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M8.242 5.992h12m-12 6.003h12m-12 5.999h12M4.117 7.495v-3.75H2.99m1.125 3.75H2.99m1.125 0H4.24m-1.25 5.728h1.228c.284 0 .514.237.514.529 0 .291-.23.528-.514.528H3.117v-.264m0-1.058h1.228c.284 0 .514.236.514.528 0 .291-.23.528-.514.528H3.117" />
        </svg>
      </ToolbarButton>
      <ToolbarButton
        active={editor.isActive("blockquote")}
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
        title="Blockquote"
      >
        <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
          <path d="M4.583 17.321C3.553 16.227 3 15 3 13.011c0-3.5 2.457-6.637 6.03-8.188l.893 1.378c-3.335 1.804-3.987 4.145-4.247 5.621.537-.278 1.24-.375 1.929-.311 1.804.167 3.226 1.648 3.226 3.489a3.5 3.5 0 0 1-3.5 3.5c-1.073 0-2.099-.49-2.748-1.179Zm10 0C13.553 16.227 13 15 13 13.011c0-3.5 2.457-6.637 6.03-8.188l.893 1.378c-3.335 1.804-3.987 4.145-4.247 5.621.537-.278 1.24-.375 1.929-.311 1.804.167 3.226 1.648 3.226 3.489a3.5 3.5 0 0 1-3.5 3.5c-1.073 0-2.099-.49-2.748-1.179Z" />
        </svg>
      </ToolbarButton>

      <Divider />

      {/* Extras */}
      <ToolbarButton
        active={editor.isActive("codeBlock")}
        onClick={() => editor.chain().focus().toggleCodeBlock().run()}
        title="Code Block"
      >
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M14.25 9.75 16.5 12l-2.25 2.25m-4.5 0L7.5 12l2.25-2.25M6 20.25h12A2.25 2.25 0 0 0 20.25 18V6A2.25 2.25 0 0 0 18 3.75H6A2.25 2.25 0 0 0 3.75 6v12A2.25 2.25 0 0 0 6 20.25Z" />
        </svg>
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().setHorizontalRule().run()}
        title="Horizontal Rule"
      >
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 12h16.5" />
        </svg>
      </ToolbarButton>
      <ToolbarButton onClick={() => setShowImagePicker(true)} title="Insert Image">
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909M3.75 21h16.5A2.25 2.25 0 0 0 22.5 18.75V5.25A2.25 2.25 0 0 0 20.25 3H3.75A2.25 2.25 0 0 0 1.5 5.25v13.5A2.25 2.25 0 0 0 3.75 21Z" />
        </svg>
      </ToolbarButton>
      <ToolbarButton
        active={editor.isActive("link")}
        onClick={editor.isActive("link") ? () => editor.chain().focus().unsetLink().run() : addLink}
        title="Link"
      >
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 0 1 1.242 7.244l-4.5 4.5a4.5 4.5 0 0 1-6.364-6.364l1.757-1.757m13.35-.622 1.757-1.757a4.5 4.5 0 0 0-6.364-6.364l-4.5 4.5a4.5 4.5 0 0 0 1.242 7.244" />
        </svg>
      </ToolbarButton>

      <Divider />

      {/* Column Layouts */}
      <div className="relative group">
        <button
          type="button"
          onClick={() => {
            const el = document.getElementById("layout-picker");
            if (el) el.classList.toggle("hidden");
          }}
          title="Insert Column Layout"
          className="flex items-center gap-1.5 rounded px-2 py-1.5 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 0 1 6 3.75h2.25A2.25 2.25 0 0 1 10.5 6v2.25a2.25 2.25 0 0 1-2.25 2.25H6a2.25 2.25 0 0 1-2.25-2.25V6ZM3.75 15.75A2.25 2.25 0 0 1 6 13.5h2.25a2.25 2.25 0 0 1 2.25 2.25V18a2.25 2.25 0 0 1-2.25 2.25H6A2.25 2.25 0 0 1 3.75 18v-2.25ZM13.5 6a2.25 2.25 0 0 1 2.25-2.25H18A2.25 2.25 0 0 1 20.25 6v2.25A2.25 2.25 0 0 1 18 10.5h-2.25a2.25 2.25 0 0 1-2.25-2.25V6ZM13.5 15.75a2.25 2.25 0 0 1 2.25-2.25H18a2.25 2.25 0 0 1 2.25 2.25V18A2.25 2.25 0 0 1 18 20.25h-2.25a2.25 2.25 0 0 1-2.25-2.25v-2.25Z" />
          </svg>
          <span className="text-xs font-medium">Layout</span>
        </button>
        {/* Tooltip */}
        <div className="pointer-events-none absolute bottom-full left-1/2 -translate-x-1/2 mb-2 whitespace-nowrap rounded bg-gray-900 px-2 py-1 text-xs text-white opacity-0 group-hover:opacity-100 transition-opacity">
          Insert column layout (2, 3, or 4 columns)
          <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-900" />
        </div>
        <div id="layout-picker" className="hidden absolute bottom-full left-0 z-50 mb-2 w-56 rounded-lg border border-gray-200 bg-white shadow-lg">
          <div className="p-2">
            <p className="px-2 py-1 text-xs font-semibold text-gray-400 uppercase">Column Layout</p>
            <button
              onClick={() => { insertColumnLayout(editor, 2, "equal"); document.getElementById("layout-picker")?.classList.add("hidden"); }}
              className="w-full rounded-md px-2 py-1.5 text-left text-sm text-gray-700 hover:bg-green-50 hover:text-green-700 flex items-center gap-2"
            >
              <div className="flex gap-0.5">
                <div className="h-4 w-6 rounded-sm bg-gray-300" />
                <div className="h-4 w-6 rounded-sm bg-gray-300" />
              </div>
              2 Columns (50/50)
            </button>
            <button
              onClick={() => { insertColumnLayout(editor, 2, "70-30"); document.getElementById("layout-picker")?.classList.add("hidden"); }}
              className="w-full rounded-md px-2 py-1.5 text-left text-sm text-gray-700 hover:bg-green-50 hover:text-green-700 flex items-center gap-2"
            >
              <div className="flex gap-0.5">
                <div className="h-4 w-8 rounded-sm bg-gray-300" />
                <div className="h-4 w-4 rounded-sm bg-gray-300" />
              </div>
              2 Columns (70/30)
            </button>
            <button
              onClick={() => { insertColumnLayout(editor, 2, "30-70"); document.getElementById("layout-picker")?.classList.add("hidden"); }}
              className="w-full rounded-md px-2 py-1.5 text-left text-sm text-gray-700 hover:bg-green-50 hover:text-green-700 flex items-center gap-2"
            >
              <div className="flex gap-0.5">
                <div className="h-4 w-4 rounded-sm bg-gray-300" />
                <div className="h-4 w-8 rounded-sm bg-gray-300" />
              </div>
              2 Columns (30/70)
            </button>
            <button
              onClick={() => { insertColumnLayout(editor, 3, "equal"); document.getElementById("layout-picker")?.classList.add("hidden"); }}
              className="w-full rounded-md px-2 py-1.5 text-left text-sm text-gray-700 hover:bg-green-50 hover:text-green-700 flex items-center gap-2"
            >
              <div className="flex gap-0.5">
                <div className="h-4 w-4 rounded-sm bg-gray-300" />
                <div className="h-4 w-4 rounded-sm bg-gray-300" />
                <div className="h-4 w-4 rounded-sm bg-gray-300" />
              </div>
              3 Columns
            </button>
            <button
              onClick={() => { insertColumnLayout(editor, 4, "equal"); document.getElementById("layout-picker")?.classList.add("hidden"); }}
              className="w-full rounded-md px-2 py-1.5 text-left text-sm text-gray-700 hover:bg-green-50 hover:text-green-700 flex items-center gap-2"
            >
              <div className="flex gap-0.5">
                <div className="h-4 w-3 rounded-sm bg-gray-300" />
                <div className="h-4 w-3 rounded-sm bg-gray-300" />
                <div className="h-4 w-3 rounded-sm bg-gray-300" />
                <div className="h-4 w-3 rounded-sm bg-gray-300" />
              </div>
              4 Columns
            </button>
          </div>
        </div>
      </div>

      <Divider />

      {/* Form Block */}
      <div className="relative group">
        <button
          type="button"
          onClick={() => setShowFormPicker(!showFormPicker)}
          title="Insert Contact Form"
          className="flex items-center gap-1.5 rounded px-2 py-1.5 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75" />
          </svg>
          <span className="text-xs font-medium">Form</span>
        </button>
        {/* Tooltip */}
        <div className="pointer-events-none absolute bottom-full left-1/2 -translate-x-1/2 mb-2 whitespace-nowrap rounded bg-gray-900 px-2 py-1 text-xs text-white opacity-0 group-hover:opacity-100 transition-opacity">
          Insert a contact form into the page
          <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-900" />
        </div>
        {showFormPicker && (
          <div className="absolute bottom-full left-0 z-50 mb-2 w-56 rounded-lg border border-gray-200 bg-white shadow-lg">
            <div className="p-2">
              <p className="px-2 py-1 text-xs font-semibold text-gray-400 uppercase">Insert Form</p>
              {forms.length === 0 ? (
                <p className="px-2 py-2 text-xs text-gray-400">
                  No forms yet.{" "}
                  <a href="/admin/forms/new" className="text-green-600 underline">Create one</a>
                </p>
              ) : (
                forms.map((form) => (
                  <button
                    key={form.id}
                    onClick={() => insertForm(form.slug, form.name)}
                    className="w-full rounded-md px-2 py-1.5 text-left text-sm text-gray-700 hover:bg-green-50 hover:text-green-700"
                  >
                    {form.name}
                    <span className="ml-1 text-xs text-gray-400">/form/{form.slug}</span>
                  </button>
                ))
              )}
            </div>
          </div>
        )}
      </div>

      {/* 3D Model Block */}
      <div className="relative group">
        <button
          type="button"
          onClick={() => {
            if (!showModelPicker) fetchModels();
            setShowModelPicker(!showModelPicker);
          }}
          title="Insert 3D Model"
          className="flex items-center gap-1.5 rounded px-2 py-1.5 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="m21 7.5-9-5.25L3 7.5m18 0-9 5.25m9-5.25v9l-9 5.25M3 7.5l9 5.25M3 7.5v9l9 5.25m0-9v9" />
          </svg>
          <span className="text-xs font-medium">3D</span>
        </button>
        <div className="pointer-events-none absolute bottom-full left-1/2 -translate-x-1/2 mb-2 whitespace-nowrap rounded bg-gray-900 px-2 py-1 text-xs text-white opacity-0 group-hover:opacity-100 transition-opacity">
          Insert a 3D model viewer
          <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-900" />
        </div>
        {showModelPicker && (
          <div className="absolute bottom-full left-0 z-50 mb-2 w-72 rounded-lg border border-gray-200 bg-white shadow-lg">
            <div className="p-2">
              <p className="px-2 py-1 text-xs font-semibold text-gray-400 uppercase">Insert 3D Model</p>

              {/* Upload button */}
              <label className={`flex w-full cursor-pointer items-center gap-2 rounded-md px-2 py-2 text-sm text-blue-600 hover:bg-blue-50 ${uploading ? "opacity-50 pointer-events-none" : ""}`}>
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5m-13.5-9L12 3m0 0 4.5 4.5M12 3v13.5" />
                </svg>
                {uploading ? "Uploading..." : "Upload GLB file"}
                <input
                  type="file"
                  accept=".glb,.gltf"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) uploadModel(file);
                    e.target.value = "";
                  }}
                />
              </label>

              {/* Paste URL */}
              <button
                onClick={() => {
                  const url = window.prompt("Enter GLB model URL:");
                  if (url) {
                    const name = url.split("/").pop()?.replace(".glb", "") || "3D Model";
                    insertModel(url, name);
                  }
                }}
                className="flex w-full items-center gap-2 rounded-md px-2 py-2 text-sm text-gray-600 hover:bg-gray-50"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 0 1 1.242 7.244l-4.5 4.5a4.5 4.5 0 0 1-6.364-6.364l1.757-1.757m13.35-.622 1.757-1.757a4.5 4.5 0 0 0-6.364-6.364l-4.5 4.5a4.5 4.5 0 0 0 1.242 7.244" />
                </svg>
                Paste URL
              </button>

              {/* Existing models */}
              {models.length > 0 && (
                <>
                  <div className="my-1 border-t border-gray-100" />
                  <p className="px-2 py-1 text-[10px] font-semibold text-gray-400 uppercase">Uploaded Models</p>
                  {models.map((model) => (
                    <button
                      key={model.url}
                      onClick={() => insertModel(model.url, model.pathname.replace("models/", ""))}
                      className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700"
                    >
                      <svg className="h-3.5 w-3.5 flex-shrink-0 text-gray-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="m21 7.5-9-5.25L3 7.5m18 0-9 5.25m9-5.25v9l-9 5.25M3 7.5l9 5.25M3 7.5v9l9 5.25m0-9v9" />
                      </svg>
                      <span className="truncate">{model.pathname.replace("models/", "")}</span>
                      <span className="ml-auto flex-shrink-0 text-[10px] text-gray-400">
                        {(model.size / (1024 * 1024)).toFixed(1)}MB
                      </span>
                    </button>
                  ))}
                </>
              )}
            </div>
          </div>
        )}
      </div>

      <Divider />

      {/* Undo/Redo */}
      <ToolbarButton
        onClick={() => editor.chain().focus().undo().run()}
        title="Undo (Ctrl+Z)"
      >
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 15 3 9m0 0 6-6M3 9h12a6 6 0 0 1 0 12h-3" />
        </svg>
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().redo().run()}
        title="Redo (Ctrl+Shift+Z)"
      >
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="m15 15 6-6m0 0-6-6m6 6H9a6 6 0 0 0 0 12h3" />
        </svg>
      </ToolbarButton>

      {/* Image Picker Modal */}
      <ImagePicker
        open={showImagePicker}
        onClose={() => setShowImagePicker(false)}
        onSelect={addImage}
      />
    </div>
  );
}
