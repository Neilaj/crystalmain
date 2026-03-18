"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface PageOption {
  id: string;
  title: string;
  slug: string;
  status: string;
}

interface HubData {
  name: string;
  slug: string;
  description: string;
  metaTitle: string;
  metaDescription: string;
  pillarPageId: string;
}

interface HubEditorProps {
  hubId?: string; // If provided, editing existing hub
}

export default function HubEditor({ hubId }: HubEditorProps) {
  const router = useRouter();
  const isEditing = !!hubId;

  const [hub, setHub] = useState<HubData>({
    name: "",
    slug: "",
    description: "",
    metaTitle: "",
    metaDescription: "",
    pillarPageId: "",
  });
  const [pages, setPages] = useState<PageOption[]>([]);
  const [spokes, setSpokes] = useState<PageOption[]>([]);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [autoSlug, setAutoSlug] = useState(true);

  // Load available pages
  useEffect(() => {
    fetch("/api/pages")
      .then((r) => r.json())
      .then((data) => setPages(data))
      .catch(() => {});
  }, []);

  // Load existing hub if editing
  useEffect(() => {
    if (!hubId) {
      setLoading(false);
      return;
    }
    fetch(`/api/hubs/${hubId}`)
      .then((r) => r.json())
      .then((data) => {
        setHub({
          name: data.name || "",
          slug: data.slug || "",
          description: data.description || "",
          metaTitle: data.metaTitle || "",
          metaDescription: data.metaDescription || "",
          pillarPageId: data.pillarPageId || "",
        });
        setSpokes(data.spokes || []);
        setAutoSlug(false);
      })
      .finally(() => setLoading(false));
  }, [hubId]);

  const slugify = (text: string) =>
    text.toLowerCase().trim().replace(/[^\w\s-]/g, "").replace(/[\s_]+/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, "");

  const handleNameChange = (name: string) => {
    setHub((prev) => ({
      ...prev,
      name,
      slug: autoSlug ? slugify(name) : prev.slug,
    }));
  };

  const handleSave = async () => {
    if (!hub.name.trim()) {
      alert("Hub name is required");
      return;
    }

    setSaving(true);
    try {
      const url = isEditing ? `/api/hubs/${hubId}` : "/api/hubs";
      const method = isEditing ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: hub.name,
          slug: hub.slug,
          description: hub.description || null,
          metaTitle: hub.metaTitle || null,
          metaDescription: hub.metaDescription || null,
          pillarPageId: hub.pillarPageId || null,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        alert(err.error || "Failed to save hub");
        return;
      }

      router.push("/admin/hubs");
      router.refresh();
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="mx-auto max-w-2xl">
        <div className="h-96 animate-pulse rounded-xl bg-gray-100" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl">
      {/* Header */}
      <div className="mb-8">
        <button
          onClick={() => router.push("/admin/hubs")}
          className="mb-4 flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
          </svg>
          Back to Hubs
        </button>
        <h1 className="text-2xl font-bold text-gray-900">
          {isEditing ? "Edit Hub" : "Create New Hub"}
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          A content hub groups related pages into a topic cluster for better AI search visibility.
        </p>
      </div>

      <div className="space-y-6">
        {/* Hub Name */}
        <div className="rounded-xl border border-gray-200 bg-white p-6">
          <label className="block text-sm font-medium text-gray-700">Hub Name</label>
          <input
            type="text"
            value={hub.name}
            onChange={(e) => handleNameChange(e.target.value)}
            placeholder="e.g., Web Design, Digital Marketing, 3D Products"
            className="mt-1 w-full rounded-lg border border-gray-300 px-4 py-2.5 text-gray-900 placeholder-gray-400 focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500"
          />

          <label className="mt-4 block text-sm font-medium text-gray-700">Slug</label>
          <div className="mt-1 flex items-center gap-2">
            <span className="text-sm text-gray-400">/hub/</span>
            <input
              type="text"
              value={hub.slug}
              onChange={(e) => {
                setAutoSlug(false);
                setHub((prev) => ({ ...prev, slug: e.target.value }));
              }}
              className="flex-1 rounded-lg border border-gray-300 px-4 py-2.5 text-gray-900 focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500"
            />
          </div>

          <label className="mt-4 block text-sm font-medium text-gray-700">Description</label>
          <textarea
            value={hub.description}
            onChange={(e) => setHub((prev) => ({ ...prev, description: e.target.value }))}
            rows={3}
            placeholder="Describe what this topic cluster covers..."
            className="mt-1 w-full rounded-lg border border-gray-300 px-4 py-2.5 text-gray-900 placeholder-gray-400 focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500"
          />
        </div>

        {/* Pillar Page */}
        <div className="rounded-xl border border-gray-200 bg-white p-6">
          <label className="block text-sm font-medium text-gray-700">Pillar Page (Optional)</label>
          <p className="mt-1 text-xs text-gray-500">
            The main page for this hub. It will be the central authority page that all spoke pages link back to.
          </p>
          <select
            value={hub.pillarPageId}
            onChange={(e) => setHub((prev) => ({ ...prev, pillarPageId: e.target.value }))}
            className="mt-2 w-full rounded-lg border border-gray-300 px-4 py-2.5 text-gray-900 focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500"
          >
            <option value="">No pillar page (auto-generated hub page)</option>
            {pages.map((page) => (
              <option key={page.id} value={page.id}>
                {page.title} (/{page.slug})
              </option>
            ))}
          </select>
        </div>

        {/* Current Spokes (edit mode only) */}
        {isEditing && (
          <div className="rounded-xl border border-gray-200 bg-white p-6">
            <label className="block text-sm font-medium text-gray-700">Spoke Pages</label>
            <p className="mt-1 text-xs text-gray-500">
              Assign pages to this hub from the page editor. Pages linked here will get internal links and structured data automatically.
            </p>
            {spokes.length === 0 ? (
              <div className="mt-4 rounded-lg border-2 border-dashed border-gray-200 py-8 text-center">
                <p className="text-sm text-gray-500">No spoke pages yet.</p>
                <p className="mt-1 text-xs text-gray-400">
                  Edit any page and select this hub in the &quot;Content Hub&quot; dropdown.
                </p>
              </div>
            ) : (
              <div className="mt-3 space-y-2">
                {spokes.map((spoke) => (
                  <div
                    key={spoke.id}
                    className="flex items-center justify-between rounded-lg border border-gray-100 bg-gray-50 px-4 py-2.5"
                  >
                    <div>
                      <span className="text-sm font-medium text-gray-900">{spoke.title}</span>
                      <span className="ml-2 text-xs text-gray-400">/{spoke.slug}</span>
                    </div>
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                        spoke.status === "PUBLISHED"
                          ? "bg-green-100 text-green-700"
                          : "bg-yellow-100 text-yellow-700"
                      }`}
                    >
                      {spoke.status}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* SEO */}
        <div className="rounded-xl border border-gray-200 bg-white p-6">
          <h3 className="text-sm font-semibold text-gray-900">SEO & AI Settings</h3>
          <p className="mt-1 text-xs text-gray-500">
            These are used for the hub landing page and appear in llms.txt and Schema.org output.
          </p>

          <label className="mt-4 block text-sm font-medium text-gray-700">Meta Title</label>
          <input
            type="text"
            value={hub.metaTitle}
            onChange={(e) => setHub((prev) => ({ ...prev, metaTitle: e.target.value }))}
            placeholder={hub.name || "Hub title for search engines"}
            className="mt-1 w-full rounded-lg border border-gray-300 px-4 py-2.5 text-gray-900 placeholder-gray-400 focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500"
          />

          <label className="mt-4 block text-sm font-medium text-gray-700">Meta Description</label>
          <textarea
            value={hub.metaDescription}
            onChange={(e) => setHub((prev) => ({ ...prev, metaDescription: e.target.value }))}
            rows={2}
            placeholder="Description for search engines and AI"
            className="mt-1 w-full rounded-lg border border-gray-300 px-4 py-2.5 text-gray-900 placeholder-gray-400 focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500"
          />
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 pb-8">
          <button
            onClick={() => router.push("/admin/hubs")}
            className="rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="rounded-lg bg-green-600 px-6 py-2.5 text-sm font-medium text-white hover:bg-green-700 disabled:opacity-50"
          >
            {saving ? "Saving..." : isEditing ? "Save Changes" : "Create Hub"}
          </button>
        </div>
      </div>
    </div>
  );
}
