"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

interface Form {
  id: string;
  name: string;
  slug: string;
  enabled: boolean;
  _count: { submissions: number };
  newSubmissions: number;
  createdAt: string;
}

export default function FormsPage() {
  const [forms, setForms] = useState<Form[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/forms")
      .then((r) => r.json())
      .then((data) => { setForms(Array.isArray(data) ? data : []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  async function toggleForm(id: string, enabled: boolean) {
    await fetch(`/api/forms/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ enabled: !enabled }),
    });
    setForms((prev) => prev.map((f) => (f.id === id ? { ...f, enabled: !enabled } : f)));
  }

  async function deleteForm(id: string) {
    if (!confirm("Delete this form and all its submissions?")) return;
    await fetch(`/api/forms/${id}`, { method: "DELETE" });
    setForms((prev) => prev.filter((f) => f.id !== id));
  }

  if (loading) {
    return <div className="py-12 text-center text-gray-400">Loading forms...</div>;
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Contact Forms</h1>
          <p className="mt-1 text-sm text-gray-500">Manage your site&apos;s contact forms and view submissions</p>
        </div>
        <Link
          href="/admin/forms/new"
          className="rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700"
        >
          + New Form
        </Link>
      </div>

      {forms.length === 0 ? (
        <div className="rounded-xl border border-gray-200 bg-white p-12 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-gray-100">
            <svg className="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75" />
            </svg>
          </div>
          <h3 className="font-semibold text-gray-900">No forms yet</h3>
          <p className="mt-1 text-sm text-gray-500">Create your first contact form to start collecting leads</p>
          <Link
            href="/admin/forms/new"
            className="mt-4 inline-block rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700"
          >
            Create Form
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {forms.map((form) => (
            <div key={form.id} className="rounded-xl border border-gray-200 bg-white p-6">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-3">
                    <h3 className="text-lg font-semibold text-gray-900">{form.name}</h3>
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                        form.enabled ? "bg-green-50 text-green-700" : "bg-gray-100 text-gray-500"
                      }`}
                    >
                      {form.enabled ? "Active" : "Disabled"}
                    </span>
                    {form.newSubmissions > 0 && (
                      <span className="rounded-full bg-red-500 px-2 py-0.5 text-xs font-medium text-white">
                        {form.newSubmissions} new
                      </span>
                    )}
                  </div>
                  <p className="mt-1 text-sm text-gray-400">/form/{form.slug}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Link
                    href={`/admin/forms/${form.id}/submissions`}
                    className="rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-50"
                  >
                    Submissions ({form._count.submissions})
                  </Link>
                  <Link
                    href={`/admin/forms/${form.id}/edit`}
                    className="rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-50"
                  >
                    Edit
                  </Link>
                  <button
                    onClick={() => toggleForm(form.id, form.enabled)}
                    className="rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-50"
                  >
                    {form.enabled ? "Disable" : "Enable"}
                  </button>
                  <button
                    onClick={() => deleteForm(form.id)}
                    className="rounded-lg border border-red-200 px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
