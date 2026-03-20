"use client";

import { useState } from "react";

interface FormField {
  name: string;
  label: string;
  type: string;
  placeholder?: string;
  required: boolean;
  options?: string[];
  width: string;
}

interface Props {
  formSlug: string;
  fields: FormField[];
  submitLabel: string;
  successMessage: string;
  honeypotEnabled: boolean;
}

export default function PublicForm({ formSlug, fields, submitLabel, successMessage, honeypotEnabled }: Props) {
  const [data, setData] = useState<Record<string, string>>({});
  const [honeypot, setHoneypot] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");
  const [loadedAt] = useState(() => Date.now());

  function updateField(name: string, value: string) {
    setData((prev) => ({ ...prev, [name]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError("");

    try {
      const res = await fetch("/api/forms/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          formSlug,
          data,
          _honeypot: honeypot,
          _loadedAt: loadedAt,
        }),
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error);
      setSubmitted(true);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Something went wrong";
      setError(message);
    } finally {
      setSubmitting(false);
    }
  }

  if (submitted) {
    return (
      <div className="rounded-2xl border border-green-200 bg-green-50 p-12 text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
          <svg className="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
          </svg>
        </div>
        <h2 className="text-xl font-bold text-green-900">Message Sent!</h2>
        <p className="mt-2 text-green-700">{successMessage}</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-2xl border border-gray-200 bg-white p-8 shadow-sm">
      {error && (
        <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Honeypot — hidden from humans, visible to bots */}
      {honeypotEnabled && (
        <div className="absolute -left-[9999px] opacity-0" aria-hidden="true">
          <label>
            Leave this empty
            <input
              type="text"
              name="_honeypot"
              value={honeypot}
              onChange={(e) => setHoneypot(e.target.value)}
              tabIndex={-1}
              autoComplete="off"
            />
          </label>
        </div>
      )}

      <div className="grid grid-cols-2 gap-5">
        {fields.map((field) => (
          <div key={field.name} className={field.width === "full" ? "col-span-2" : "col-span-1"}>
            <label className="block text-sm font-medium text-gray-700">
              {field.label}
              {field.required && <span className="ml-1 text-red-500">*</span>}
            </label>

            {field.type === "textarea" ? (
              <textarea
                value={data[field.name] || ""}
                onChange={(e) => updateField(field.name, e.target.value)}
                placeholder={field.placeholder}
                required={field.required}
                rows={5}
                className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-2.5 text-gray-900 placeholder-gray-400 focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500"
              />
            ) : field.type === "select" ? (
              <select
                value={data[field.name] || ""}
                onChange={(e) => updateField(field.name, e.target.value)}
                required={field.required}
                className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-2.5 text-gray-900 focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500"
              >
                <option value="">Select...</option>
                {(field.options || []).map((opt) => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
            ) : (
              <input
                type={field.type}
                value={data[field.name] || ""}
                onChange={(e) => updateField(field.name, e.target.value)}
                placeholder={field.placeholder}
                required={field.required}
                className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-2.5 text-gray-900 placeholder-gray-400 focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500"
              />
            )}
          </div>
        ))}
      </div>

      <button
        type="submit"
        disabled={submitting}
        className="mt-6 w-full rounded-lg bg-green-600 px-6 py-3 text-sm font-semibold text-white hover:bg-green-700 disabled:opacity-50 transition-colors"
      >
        {submitting ? (
          <span className="flex items-center justify-center gap-2">
            <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            Sending...
          </span>
        ) : (
          submitLabel
        )}
      </button>
    </form>
  );
}
