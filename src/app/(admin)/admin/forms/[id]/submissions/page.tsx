"use client";

import { useState, useEffect, use } from "react";
import Link from "next/link";

interface Submission {
  id: string;
  data: Record<string, string>;
  status: "NEW" | "READ" | "REPLIED" | "ARCHIVED";
  createdAt: string;
  ipAddress?: string;
}

interface Form {
  id: string;
  name: string;
  slug: string;
  fields: Array<{ name: string; label: string; type: string }>;
  _count: { submissions: number };
}

export default function SubmissionsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [form, setForm] = useState<Form | null>(null);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [selected, setSelected] = useState<Submission | null>(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>("all");
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    Promise.all([
      fetch(`/api/forms/${id}`).then((r) => r.json()),
      fetch(`/api/forms/${id}/submissions`).then((r) => r.json()),
    ]).then(([formData, subsData]) => {
      setForm(formData);
      setSubmissions(subsData);
      setLoading(false);
    });
  }, [id]);

  async function deleteSubmission(submissionId: string) {
    if (!confirm("Permanently delete this submission?")) return;
    setDeleting(true);
    await fetch(`/api/forms/${id}/submissions`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ submissionId }),
    });
    setSubmissions((prev) => prev.filter((s) => s.id !== submissionId));
    setSelected(null);
    setDeleting(false);
  }

  async function updateStatus(submissionId: string, status: string) {
    await fetch(`/api/forms/${id}/submissions`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ submissionId, status }),
    });
    setSubmissions((prev) =>
      prev.map((s) => (s.id === submissionId ? { ...s, status: status as Submission["status"] } : s))
    );
    if (selected?.id === submissionId) {
      setSelected({ ...selected, status: status as Submission["status"] });
    }
  }

  function selectSubmission(sub: Submission) {
    setSelected(sub);
    if (sub.status === "NEW") {
      updateStatus(sub.id, "READ");
    }
  }

  const filtered = submissions.filter((s) => {
    if (filter === "all") return true;
    return s.status === filter;
  });

  if (loading) return <div className="py-12 text-center text-gray-400">Loading...</div>;
  if (!form) return <div className="py-12 text-center text-gray-400">Form not found</div>;

  return (
    <div>
      <div className="mb-6">
        <Link href="/admin/forms" className="text-sm text-gray-400 hover:text-gray-600">
          ← Back to Forms
        </Link>
        <h1 className="mt-2 text-2xl font-bold text-gray-900">{form.name} — Submissions</h1>
        <p className="mt-1 text-sm text-gray-500">{form._count.submissions} total submissions</p>
      </div>

      {/* Filters */}
      <div className="mb-4 flex gap-1 rounded-lg bg-gray-100 p-1 w-fit">
        {[
          { key: "all", label: "All" },
          { key: "NEW", label: "New" },
          { key: "READ", label: "Read" },
          { key: "REPLIED", label: "Replied" },
          { key: "ARCHIVED", label: "Archived" },
        ].map((f) => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={`rounded-md px-3 py-1 text-xs font-medium transition-colors ${
              filter === f.key ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"
            }`}
          >
            {f.label}
            {f.key !== "all" && (
              <span className="ml-1 text-gray-400">
                ({submissions.filter((s) => s.status === f.key).length})
              </span>
            )}
          </button>
        ))}
      </div>

      {submissions.length === 0 ? (
        <div className="rounded-xl border border-gray-200 bg-white p-12 text-center">
          <p className="text-gray-400">No submissions yet</p>
          <p className="mt-1 text-sm text-gray-400">
            Share your form at <span className="font-mono text-green-600">/form/{form.slug}</span>
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-6">
          {/* Submission list */}
          <div className="col-span-1 space-y-2 max-h-[70vh] overflow-y-auto">
            {filtered.map((sub) => (
              <button
                key={sub.id}
                onClick={() => selectSubmission(sub)}
                className={`w-full rounded-lg border p-3 text-left transition-colors ${
                  selected?.id === sub.id
                    ? "border-green-300 bg-green-50"
                    : sub.status === "NEW"
                    ? "border-blue-200 bg-blue-50 hover:bg-blue-100"
                    : "border-gray-200 bg-white hover:bg-gray-50"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-900">
                    {sub.data.name || sub.data.email || "Anonymous"}
                  </span>
                  {sub.status === "NEW" && (
                    <span className="h-2 w-2 rounded-full bg-blue-500" />
                  )}
                </div>
                {sub.data.subject && (
                  <p className="mt-0.5 text-xs text-gray-500 truncate">{sub.data.subject}</p>
                )}
                <p className="mt-1 text-xs text-gray-400">
                  {new Date(sub.createdAt).toLocaleDateString()} at{" "}
                  {new Date(sub.createdAt).toLocaleTimeString()}
                </p>
              </button>
            ))}
          </div>

          {/* Submission detail */}
          <div className="col-span-2">
            {selected ? (
              <div className="rounded-xl border border-gray-200 bg-white p-6">
                <div className="mb-4 flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900">
                    {selected.data.name || "Submission"}
                  </h3>
                  <div className="flex gap-2">
                    {selected.status !== "REPLIED" && (
                      <button
                        onClick={() => updateStatus(selected.id, "REPLIED")}
                        className="rounded-lg bg-green-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-green-700"
                      >
                        Mark Replied
                      </button>
                    )}
                    {selected.status !== "ARCHIVED" && (
                      <button
                        onClick={() => updateStatus(selected.id, "ARCHIVED")}
                        className="rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-50"
                      >
                        Archive
                      </button>
                    )}
                    <button
                      onClick={() => deleteSubmission(selected.id)}
                      disabled={deleting}
                      className="rounded-lg border border-red-200 px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 disabled:opacity-50"
                    >
                      Delete
                    </button>
                  </div>
                </div>

                <div className="space-y-4">
                  {(() => {
                    // Build a label map from form fields
                    const labelMap: Record<string, string> = {};
                    form.fields.forEach((f) => { labelMap[f.name] = f.label; });

                    // Show all keys from the submission data (form fields first, then extras)
                    const formKeys = form.fields.map((f) => f.name);
                    const extraKeys = Object.keys(selected.data).filter((k) => !formKeys.includes(k));
                    const allKeys = [...formKeys, ...extraKeys];

                    return allKeys.map((key) => (
                      <div key={key}>
                        <label className="block text-xs font-medium uppercase text-gray-400">
                          {labelMap[key] || key.charAt(0).toUpperCase() + key.slice(1)}
                        </label>
                        <p className="mt-1 text-sm text-gray-900 whitespace-pre-wrap">
                          {selected.data[key] || "—"}
                        </p>
                      </div>
                    ));
                  })()}
                </div>

                <div className="mt-6 border-t border-gray-100 pt-4">
                  <p className="text-xs text-gray-400">
                    Submitted {new Date(selected.createdAt).toLocaleString()}
                    {selected.ipAddress && ` · IP: ${selected.ipAddress}`}
                  </p>
                  <p className="mt-1 text-xs text-gray-400">
                    Status:{" "}
                    <span className={`font-medium ${
                      selected.status === "NEW" ? "text-blue-600" :
                      selected.status === "READ" ? "text-gray-600" :
                      selected.status === "REPLIED" ? "text-green-600" :
                      "text-gray-400"
                    }`}>
                      {selected.status}
                    </span>
                  </p>
                </div>
              </div>
            ) : (
              <div className="rounded-xl border border-gray-200 bg-white p-12 text-center text-gray-400">
                Select a submission to view details
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
