"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface Hub {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  pillarPage: { id: string; title: string; slug: string } | null;
  _count: { spokes: number };
  updatedAt: string;
}

export default function HubsPage() {
  const [hubs, setHubs] = useState<Hub[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/hubs")
      .then((r) => r.json())
      .then(setHubs)
      .finally(() => setLoading(false));
  }, []);

  const deleteHub = async (id: string, name: string) => {
    if (!confirm(`Delete hub "${name}"? Spoke pages will be unlinked but not deleted.`)) return;
    await fetch(`/api/hubs/${id}`, { method: "DELETE" });
    setHubs((prev) => prev.filter((h) => h.id !== id));
  };

  return (
    <div>
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Content Hubs</h1>
          <p className="mt-1 text-sm text-gray-500">
            Organize pages into topic clusters for better SEO & AI search visibility
          </p>
        </div>
        <Link
          href="/admin/hubs/new"
          className="rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700"
        >
          + New Hub
        </Link>
      </div>

      {/* How it works */}
      <div className="mb-8 rounded-xl border border-blue-100 bg-blue-50 p-5">
        <h3 className="text-sm font-semibold text-blue-900">How Content Hubs Work</h3>
        <div className="mt-2 grid grid-cols-1 gap-4 text-sm text-blue-800 md:grid-cols-3">
          <div className="flex gap-2">
            <span className="mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-blue-200 text-xs font-bold text-blue-900">1</span>
            <span><strong>Create a Hub</strong> — define a topic cluster (e.g., &quot;Web Design&quot;)</span>
          </div>
          <div className="flex gap-2">
            <span className="mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-blue-200 text-xs font-bold text-blue-900">2</span>
            <span><strong>Assign Spokes</strong> — link related pages to the hub from the page editor</span>
          </div>
          <div className="flex gap-2">
            <span className="mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-blue-200 text-xs font-bold text-blue-900">3</span>
            <span><strong>Auto-optimized</strong> — Parsley generates internal links, Schema.org, and llms.txt groupings</span>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="space-y-4">
          {[1, 2].map((i) => (
            <div key={i} className="h-28 animate-pulse rounded-xl border border-gray-200 bg-gray-50" />
          ))}
        </div>
      ) : hubs.length === 0 ? (
        <div className="rounded-xl border-2 border-dashed border-gray-300 py-16 text-center">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M7.217 10.907a2.25 2.25 0 1 0 0 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186 9.566-5.314m-9.566 7.5 9.566 5.314m0 0a2.25 2.25 0 1 0 3.935 2.186 2.25 2.25 0 0 0-3.935-2.186Zm0-12.814a2.25 2.25 0 1 0 3.933-2.185 2.25 2.25 0 0 0-3.933 2.185Z" />
          </svg>
          <h3 className="mt-4 text-lg font-medium text-gray-900">No content hubs yet</h3>
          <p className="mt-2 text-sm text-gray-500">
            Create your first hub to start organizing content into topic clusters.
          </p>
          <Link
            href="/admin/hubs/new"
            className="mt-6 inline-flex rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700"
          >
            Create your first hub
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {hubs.map((hub) => (
            <div
              key={hub.id}
              className="rounded-xl border border-gray-200 bg-white p-5 transition-shadow hover:shadow-md"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <h3 className="text-lg font-semibold text-gray-900">{hub.name}</h3>
                    <span className="rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-700">
                      {hub._count.spokes} spoke{hub._count.spokes !== 1 ? "s" : ""}
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-gray-500">/hub/{hub.slug}</p>
                  {hub.description && (
                    <p className="mt-2 text-sm text-gray-600">{hub.description}</p>
                  )}
                  {hub.pillarPage && (
                    <p className="mt-2 text-sm text-gray-500">
                      Pillar page: <span className="font-medium text-gray-700">{hub.pillarPage.title}</span>
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <Link
                    href={`/admin/hubs/${hub.id}/edit`}
                    className="rounded-lg border border-gray-200 px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-50"
                  >
                    Edit
                  </Link>
                  <button
                    onClick={() => deleteHub(hub.id, hub.name)}
                    className="rounded-lg border border-gray-200 px-3 py-1.5 text-sm text-red-600 hover:bg-red-50"
                  >
                    Delete
                  </button>
                </div>
              </div>

              {/* Spoke pages preview */}
              {hub._count.spokes > 0 && (
                <div className="mt-4 border-t border-gray-100 pt-3">
                  <p className="mb-2 text-xs font-medium uppercase tracking-wide text-gray-400">Spoke Pages</p>
                  <div className="flex flex-wrap gap-2">
                    {(hub as unknown as { spokes: { id: string; title: string; status: string }[] }).spokes?.map((spoke) => (
                      <span
                        key={spoke.id}
                        className={`rounded-md px-2 py-1 text-xs font-medium ${
                          spoke.status === "PUBLISHED"
                            ? "bg-gray-100 text-gray-700"
                            : "bg-yellow-50 text-yellow-700"
                        }`}
                      >
                        {spoke.title}
                        {spoke.status === "DRAFT" && " (draft)"}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
