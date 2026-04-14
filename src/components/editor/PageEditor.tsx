"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import AIAssistant from "./AIAssistant";

const Editor = dynamic(() => import("./Editor"), { ssr: false });

const CONTENT_TYPES = [
  { value: "PAGE", label: "Page", description: "Generic page" },
  { value: "ARTICLE", label: "Article", description: "Blog post or article" },
  { value: "FAQ", label: "FAQ", description: "Frequently asked questions" },
  { value: "LANDING", label: "Landing", description: "Landing page" },
  { value: "SERVICE", label: "Service", description: "Service offering" },
  { value: "PRODUCT", label: "Product", description: "Product page" },
  { value: "PORTFOLIO", label: "Portfolio", description: "Portfolio piece" },
  { value: "CONTACT", label: "Contact", description: "Contact page" },
];

interface HubOption {
  id: string;
  name: string;
  slug: string;
}

interface PageData {
  id?: string;
  title: string;
  slug: string;
  content: Record<string, unknown> | null;
  contentType: string;
  collection: string;
  status: string;
  metaTitle: string;
  metaDescription: string;
  excerpt: string;
  hubId?: string;
  hub?: HubOption | null;
}

interface PageEditorProps {
  page?: PageData;
  isNew?: boolean;
}

export default function PageEditor({ page, isNew }: PageEditorProps) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [showSeo, setShowSeo] = useState(false);

  const [title, setTitle] = useState(page?.title || "");
  const [slug, setSlug] = useState(page?.slug || "");
  const [content, setContent] = useState<Record<string, unknown> | null>(
    page?.content || null
  );
  const [contentType, setContentType] = useState(page?.contentType || "PAGE");
  const [collection, setCollection] = useState(page?.collection || "");
  const [status, setStatus] = useState(page?.status || "DRAFT");
  const [metaTitle, setMetaTitle] = useState(page?.metaTitle || "");
  const [metaDescription, setMetaDescription] = useState(
    page?.metaDescription || ""
  );
  const [excerpt, setExcerpt] = useState(page?.excerpt || "");
  const [hubId, setHubId] = useState(page?.hubId || page?.hub?.id || "");
  const [hubs, setHubs] = useState<HubOption[]>([]);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const editorRef = useRef<any>(null);

  // Fetch available hubs
  useEffect(() => {
    fetch("/api/hubs")
      .then((r) => r.json())
      .then((data) => setHubs(data.map((h: HubOption) => ({ id: h.id, name: h.name, slug: h.slug }))))
      .catch(() => {});
  }, []);

  // Auto-generate slug from title
  const handleTitleChange = (newTitle: string) => {
    setTitle(newTitle);
    if (isNew || slug === slugify(title)) {
      setSlug(slugify(newTitle));
    }
  };

  const handleSave = async (publishStatus?: string) => {
    if (!title.trim()) {
      setError("Title is required");
      return;
    }

    setSaving(true);
    setError("");

    // Always read content directly from the editor instance — this is the
    // source of truth and avoids any React state sync timing issues.
    const latestContent = editorRef.current
      ? (editorRef.current.getJSON() as Record<string, unknown>)
      : content;

    const finalStatus = publishStatus || status;
    const body = {
      title,
      slug: slug || slugify(title),
      content: latestContent,
      contentType,
      collection: collection || null,
      hubId: hubId || null,
      status: finalStatus,
      metaTitle: metaTitle || null,
      metaDescription: metaDescription || null,
      excerpt: excerpt || null,
    };

    try {
      const url = isNew ? "/api/pages" : `/api/pages/${page?.id}`;
      const method = isNew ? "POST" : "PUT";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to save");
      }

      router.push("/admin/pages");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!page?.id) return;
    if (!confirm("Are you sure you want to delete this page?")) return;

    try {
      const res = await fetch(`/api/pages/${page.id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete");
      router.push("/admin/pages");
      router.refresh();
    } catch {
      setError("Failed to delete page");
    }
  };

  const handleContentChange = useCallback(
    (newContent: Record<string, unknown>) => {
      setContent(newContent);
    },
    []
  );

  return (
    <div>
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {isNew ? "New Page" : "Edit Page"}
          </h1>
        </div>
        <div className="flex items-center gap-3">
          {!isNew && (
            <button
              type="button"
              onClick={handleDelete}
              className="rounded-lg border border-red-200 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50"
            >
              Delete
            </button>
          )}
          <button
            type="button"
            onClick={() => handleSave("DRAFT")}
            disabled={saving}
            className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
          >
            Save Draft
          </button>
          <button
            type="button"
            onClick={() => handleSave("PUBLISHED")}
            disabled={saving}
            className="rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 disabled:opacity-50"
          >
            {saving ? "Saving..." : "Publish"}
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-600">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-4">
          {/* Title */}
          <input
            type="text"
            value={title}
            onChange={(e) => handleTitleChange(e.target.value)}
            placeholder="Page title"
            className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-xl font-semibold text-gray-900 placeholder-gray-400 focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500"
          />

          {/* Slug */}
          <div className="flex items-center gap-2 rounded-lg bg-gray-50 px-4 py-2">
            <span className="text-sm text-gray-400">/</span>
            <input
              type="text"
              value={slug}
              onChange={(e) => setSlug(slugify(e.target.value))}
              placeholder="page-slug"
              className="flex-1 bg-transparent text-sm text-gray-600 focus:outline-none"
            />
          </div>

          {/* Editor */}
          <Editor
            content={content}
            onChange={handleContentChange}
            onEditorReady={(editor) => { editorRef.current = editor; }}
          />
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Status */}
          <div className="rounded-xl border border-gray-200 bg-white p-4">
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Status
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500"
            >
              <option value="DRAFT">Draft</option>
              <option value="PUBLISHED">Published</option>
              <option value="ARCHIVED">Archived</option>
            </select>
          </div>

          {/* Content Type */}
          <div className="rounded-xl border border-gray-200 bg-white p-4">
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Content Type
            </label>
            <p className="mb-3 text-xs text-gray-400">
              Drives AI structured data (Schema.org)
            </p>
            <div className="space-y-1.5">
              {CONTENT_TYPES.map((type) => (
                <label
                  key={type.value}
                  className={`flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2 transition-colors ${
                    contentType === type.value
                      ? "bg-green-50 ring-1 ring-green-200"
                      : "hover:bg-gray-50"
                  }`}
                >
                  <input
                    type="radio"
                    name="contentType"
                    value={type.value}
                    checked={contentType === type.value}
                    onChange={(e) => setContentType(e.target.value)}
                    className="accent-green-600"
                  />
                  <div>
                    <div className="text-sm font-medium text-gray-700">
                      {type.label}
                    </div>
                    <div className="text-xs text-gray-400">
                      {type.description}
                    </div>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Collection */}
          <div className="rounded-xl border border-gray-200 bg-white p-4">
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Collection (optional)
            </label>
            <p className="mb-2 text-xs text-gray-400">
              Group pages together (e.g. &quot;Blog&quot;, &quot;Services&quot;)
            </p>
            <input
              type="text"
              value={collection}
              onChange={(e) => setCollection(e.target.value)}
              placeholder="e.g. Blog"
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500"
            />
          </div>

          {/* Content Hub */}
          <div className="rounded-xl border border-gray-200 bg-white p-4">
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Content Hub
            </label>
            <p className="mb-2 text-xs text-gray-400">
              Link this page to a topic cluster for better AI search visibility
            </p>
            {hubs.length === 0 ? (
              <div className="rounded-lg border border-dashed border-gray-200 p-3 text-center">
                <p className="text-xs text-gray-400">No hubs created yet.</p>
                <a
                  href="/admin/hubs/new"
                  target="_blank"
                  className="mt-1 inline-block text-xs font-medium text-green-600 hover:text-green-700"
                >
                  Create a hub →
                </a>
              </div>
            ) : (
              <select
                value={hubId}
                onChange={(e) => setHubId(e.target.value)}
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500"
              >
                <option value="">No hub (standalone page)</option>
                {hubs.map((hub) => (
                  <option key={hub.id} value={hub.id}>
                    {hub.name}
                  </option>
                ))}
              </select>
            )}
            {hubId && (
              <p className="mt-2 text-xs text-green-600">
                ✓ This page will appear as a spoke in the &quot;{hubs.find((h) => h.id === hubId)?.name}&quot; hub
              </p>
            )}
          </div>

          {/* SEO Fields */}
          <div className="rounded-xl border border-gray-200 bg-white p-4">
            <button
              type="button"
              onClick={() => setShowSeo(!showSeo)}
              className="flex w-full items-center justify-between text-sm font-medium text-gray-700"
            >
              SEO & AI Optimization
              <svg
                className={`h-4 w-4 transition-transform ${showSeo ? "rotate-180" : ""}`}
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
              </svg>
            </button>

            {showSeo && (
              <div className="mt-4 space-y-3">
                <div>
                  <label className="mb-1 block text-xs font-medium text-gray-500">
                    Meta Title
                  </label>
                  <input
                    type="text"
                    value={metaTitle}
                    onChange={(e) => setMetaTitle(e.target.value)}
                    placeholder={title || "Page title"}
                    className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500"
                  />
                  <p className="mt-1 text-xs text-gray-400">
                    {(metaTitle || title).length}/60 characters
                  </p>
                </div>

                <div>
                  <label className="mb-1 block text-xs font-medium text-gray-500">
                    Meta Description
                  </label>
                  <textarea
                    value={metaDescription}
                    onChange={(e) => setMetaDescription(e.target.value)}
                    placeholder="Brief description for search engines and AI"
                    rows={3}
                    className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500"
                  />
                  <p className="mt-1 text-xs text-gray-400">
                    {metaDescription.length}/160 characters
                  </p>
                </div>

                <div>
                  <label className="mb-1 block text-xs font-medium text-gray-500">
                    Excerpt
                  </label>
                  <textarea
                    value={excerpt}
                    onChange={(e) => setExcerpt(e.target.value)}
                    placeholder="Short summary shown in listings"
                    rows={2}
                    className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500"
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* AI Writing Assistant */}
      <AIAssistant
        pageTitle={title}
        contentType={contentType}
        hubName={hubs.find((h) => h.id === hubId)?.name}
        currentContent={editorRef.current?.getHTML?.() || ""}
        onInsert={(html: string) => {
          if (editorRef.current) {
            editorRef.current.chain().focus().insertContent(html).run();
          }
        }}
      />
    </div>
  );
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}
