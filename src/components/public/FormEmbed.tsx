"use client";

import { useState, useEffect } from "react";
import PublicForm from "./PublicForm";

interface FormData {
  slug: string;
  name: string;
  fields: Array<{
    name: string;
    label: string;
    type: string;
    placeholder?: string;
    required: boolean;
    options?: string[];
    width: string;
  }>;
  submitLabel: string;
  successMessage: string;
  honeypotEnabled: boolean;
}

export default function FormEmbed({ formSlug }: { formSlug: string }) {
  const [form, setForm] = useState<FormData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/forms/public/${formSlug}`)
      .then((r) => r.json())
      .then((data) => {
        if (data && !data.error) setForm(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [formSlug]);

  if (loading) {
    return (
      <div className="my-8 rounded-xl border border-gray-200 bg-gray-50 p-12 text-center">
        <p className="text-sm text-gray-400">Loading form...</p>
      </div>
    );
  }

  if (!form) {
    return null;
  }

  return (
    <div className="my-8">
      <PublicForm
        formSlug={form.slug}
        fields={form.fields}
        submitLabel={form.submitLabel}
        successMessage={form.successMessage}
        honeypotEnabled={form.honeypotEnabled}
      />
    </div>
  );
}
