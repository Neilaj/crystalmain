"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface FormField {
  id: string;
  name: string;
  label: string;
  type: "text" | "email" | "tel" | "textarea" | "select";
  placeholder?: string;
  required: boolean;
  options?: string[];
  width: "full" | "half";
}

export default function EditFormPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [submitLabel, setSubmitLabel] = useState("Send Message");
  const [successMessage, setSuccessMessage] = useState("");
  const [notifyEmail, setNotifyEmail] = useState("");
  const [enabled, setEnabled] = useState(true);
  const [fields, setFields] = useState<FormField[]>([]);

  useEffect(() => {
    fetch(`/api/forms/${id}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.error) { setError(data.error); setLoading(false); return; }
        setName(data.name);
        setSlug(data.slug);
        setDescription(data.description || "");
        setSubmitLabel(data.submitLabel);
        setSuccessMessage(data.successMessage);
        setNotifyEmail(data.notifyEmail || "");
        setEnabled(data.enabled);
        setFields(
          (data.fields as FormField[]).map((f, i) => ({ ...f, id: f.id || String(i) }))
        );
        setLoading(false);
      })
      .catch(() => { setError("Failed to load form"); setLoading(false); });
  }, [id]);

  function addField() {
    const fid = Date.now().toString();
    setFields([...fields, {
      id: fid, name: `field_${fid}`, label: "New Field", type: "text",
      placeholder: "", required: false, width: "full",
    }]);
  }

  function removeField(fid: string) {
    setFields(fields.filter((f) => f.id !== fid));
  }

  function updateField(fid: string, updates: Partial<FormField>) {
    setFields(fields.map((f) => (f.id === fid ? { ...f, ...updates } : f)));
  }

  function moveField(index: number, direction: "up" | "down") {
    const newFields = [...fields];
    const target = direction === "up" ? index - 1 : index + 1;
    if (target < 0 || target >= newFields.length) return;
    [newFields[index], newFields[target]] = [newFields[target], newFields[index]];
    setFields(newFields);
  }

  async function handleSave() {
    setSaving(true);
    setError("");
    try {
      const res = await fetch(`/api/forms/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name, slug, description: description || null,
          fields: fields.map(({ id: _id, ...rest }) => rest),
          submitLabel, successMessage,
          notifyEmail: notifyEmail || null, enabled,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      router.push("/admin/forms");
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Save failed";
      setError(message);
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <div className="py-12 text-center text-gray-400">Loading...</div>;

  return (
    <div className="mx-auto max-w-4xl">
      <div className="mb-6">
        <Link href="/admin/forms" className="text-sm text-gray-400 hover:text-gray-600">← Back to Forms</Link>
        <h1 className="mt-2 text-2xl font-bold text-gray-900">Edit Form</h1>
      </div>

      {error && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div>
      )}

      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2 space-y-6">
          {/* Settings */}
          <div className="rounded-xl border border-gray-200 bg-white p-6">
            <h2 className="mb-4 text-lg font-semibold text-gray-900">Form Settings</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Form Name</label>
                <input type="text" value={name} onChange={(e) => setName(e.target.value)}
                  className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">URL Slug</label>
                <div className="mt-1 flex items-center rounded-lg border border-gray-300">
                  <span className="px-3 text-sm text-gray-400">/form/</span>
                  <input type="text" value={slug}
                    onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""))}
                    className="block w-full rounded-r-lg border-0 px-1 py-2 text-sm focus:outline-none focus:ring-0" />
                </div>
              </div>
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700">Description</label>
                <input type="text" value={description} onChange={(e) => setDescription(e.target.value)}
                  placeholder="Get in touch with us"
                  className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Submit Button Text</label>
                <input type="text" value={submitLabel} onChange={(e) => setSubmitLabel(e.target.value)}
                  className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Notification Email</label>
                <input type="email" value={notifyEmail} onChange={(e) => setNotifyEmail(e.target.value)}
                  placeholder="you@company.com"
                  className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500" />
              </div>
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700">Success Message</label>
                <input type="text" value={successMessage} onChange={(e) => setSuccessMessage(e.target.value)}
                  className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500" />
              </div>
              <div className="col-span-2">
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                  <input type="checkbox" checked={enabled} onChange={(e) => setEnabled(e.target.checked)}
                    className="h-4 w-4 rounded border-gray-300 text-green-600 focus:ring-green-500" />
                  Form is active and accepting submissions
                </label>
              </div>
            </div>
          </div>

          {/* Fields */}
          <div className="rounded-xl border border-gray-200 bg-white p-6">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">Form Fields</h2>
              <button onClick={addField}
                className="rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-50">
                + Add Field
              </button>
            </div>
            <div className="space-y-3">
              {fields.map((field, index) => (
                <div key={field.id} className="rounded-lg border border-gray-200 bg-gray-50 p-4">
                  <div className="mb-3 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <button onClick={() => moveField(index, "up")} disabled={index === 0}
                        className="text-gray-400 hover:text-gray-600 disabled:opacity-30">↑</button>
                      <button onClick={() => moveField(index, "down")} disabled={index === fields.length - 1}
                        className="text-gray-400 hover:text-gray-600 disabled:opacity-30">↓</button>
                      <span className="text-sm font-medium text-gray-700">{field.label}</span>
                    </div>
                    <button onClick={() => removeField(field.id)} className="text-xs text-red-500 hover:text-red-700">Remove</button>
                  </div>
                  <div className="grid grid-cols-4 gap-3">
                    <div>
                      <label className="block text-xs text-gray-500">Label</label>
                      <input type="text" value={field.label}
                        onChange={(e) => updateField(field.id, {
                          label: e.target.value,
                          name: e.target.value.toLowerCase().replace(/\s+/g, "_").replace(/[^a-z0-9_]/g, ""),
                        })}
                        className="mt-1 block w-full rounded border border-gray-200 px-2 py-1.5 text-xs focus:border-green-500 focus:outline-none" />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500">Type</label>
                      <select value={field.type} onChange={(e) => updateField(field.id, { type: e.target.value as FormField["type"] })}
                        className="mt-1 block w-full rounded border border-gray-200 px-2 py-1.5 text-xs focus:border-green-500 focus:outline-none">
                        <option value="text">Text</option>
                        <option value="email">Email</option>
                        <option value="tel">Phone</option>
                        <option value="textarea">Text Area</option>
                        <option value="select">Dropdown</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500">Width</label>
                      <select value={field.width} onChange={(e) => updateField(field.id, { width: e.target.value as "full" | "half" })}
                        className="mt-1 block w-full rounded border border-gray-200 px-2 py-1.5 text-xs focus:border-green-500 focus:outline-none">
                        <option value="full">Full Width</option>
                        <option value="half">Half Width</option>
                      </select>
                    </div>
                    <div className="flex items-end">
                      <label className="flex items-center gap-2 text-xs">
                        <input type="checkbox" checked={field.required}
                          onChange={(e) => updateField(field.id, { required: e.target.checked })}
                          className="h-3.5 w-3.5 rounded border-gray-300 text-green-600 focus:ring-green-500" />
                        Required
                      </label>
                    </div>
                  </div>
                  <div className="mt-2">
                    <label className="block text-xs text-gray-500">Placeholder</label>
                    <input type="text" value={field.placeholder || ""}
                      onChange={(e) => updateField(field.id, { placeholder: e.target.value })}
                      className="mt-1 block w-full rounded border border-gray-200 px-2 py-1.5 text-xs focus:border-green-500 focus:outline-none" />
                  </div>
                  {field.type === "select" && (
                    <div className="mt-2">
                      <label className="block text-xs text-gray-500">Options (comma-separated)</label>
                      <input type="text" value={(field.options || []).join(", ")}
                        onChange={(e) => updateField(field.id, { options: e.target.value.split(",").map((o) => o.trim()) })}
                        placeholder="Option 1, Option 2, Option 3"
                        className="mt-1 block w-full rounded border border-gray-200 px-2 py-1.5 text-xs focus:border-green-500 focus:outline-none" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Preview + Save */}
        <div className="space-y-6">
          <div className="sticky top-4 rounded-xl border border-gray-200 bg-white p-6">
            <h3 className="mb-4 text-sm font-semibold text-gray-900">Preview</h3>
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                {fields.map((field) => (
                  <div key={field.id} className={field.width === "full" ? "col-span-2" : "col-span-1"}>
                    <label className="block text-xs font-medium text-gray-700">
                      {field.label} {field.required && <span className="text-red-500">*</span>}
                    </label>
                    {field.type === "textarea" ? (
                      <textarea placeholder={field.placeholder} rows={3} disabled
                        className="mt-1 block w-full rounded border border-gray-200 bg-gray-50 px-2 py-1.5 text-xs" />
                    ) : field.type === "select" ? (
                      <select disabled className="mt-1 block w-full rounded border border-gray-200 bg-gray-50 px-2 py-1.5 text-xs">
                        <option>Select...</option>
                        {(field.options || []).map((opt) => <option key={opt}>{opt}</option>)}
                      </select>
                    ) : (
                      <input type={field.type} placeholder={field.placeholder} disabled
                        className="mt-1 block w-full rounded border border-gray-200 bg-gray-50 px-2 py-1.5 text-xs" />
                    )}
                  </div>
                ))}
              </div>
              <button disabled className="w-full rounded-lg bg-green-600 px-4 py-2 text-xs font-medium text-white">
                {submitLabel}
              </button>
            </div>
          </div>

          <button onClick={handleSave} disabled={saving || !name || !slug || fields.length === 0}
            className="w-full rounded-lg bg-green-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-green-700 disabled:opacity-50">
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
}
