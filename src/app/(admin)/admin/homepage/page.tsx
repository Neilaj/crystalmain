"use client";

import { useEffect, useState } from "react";
import { DEFAULT_HOMEPAGE_CONTENT, type HomepageContent } from "@/types/homepage-content";

const inputClass =
  "w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm focus:border-red-400 focus:outline-none focus:ring-1 focus:ring-red-400";

// Strip accidental localhost prefix pasted from browser address bar
function cleanUrl(url: string): string {
  return url.replace(/^https?:\/\/localhost:\d+/, "");
}
const textareaClass =
  "w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm focus:border-red-400 focus:outline-none focus:ring-1 focus:ring-red-400 resize-none";

function Label({ children }: { children: React.ReactNode }) {
  return <label className="block text-sm font-medium text-gray-700 mb-1">{children}</label>;
}

function SectionCard({
  title,
  defaultOpen = false,
  children,
}: {
  title: string;
  defaultOpen?: boolean;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between px-6 py-4 text-left"
      >
        <h3 className="text-base font-semibold text-gray-900">{title}</h3>
        <svg
          className={`h-5 w-5 text-gray-400 transition-transform ${open ? "rotate-180" : ""}`}
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
        </svg>
      </button>
      {open && <div className="border-t border-gray-100 px-6 py-5 space-y-4">{children}</div>}
    </div>
  );
}

export default function HomepageEditorPage() {
  const [config, setConfig] = useState<HomepageContent | null>(null);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ type: "success" | "error"; message: string } | null>(null);

  useEffect(() => {
    fetch("/api/homepage")
      .then((r) => r.json())
      .then((data) => {
        if (data && typeof data === "object" && data.hero) {
          setConfig(data as HomepageContent);
        } else {
          setConfig(DEFAULT_HOMEPAGE_CONTENT);
        }
      })
      .catch(() => setConfig(DEFAULT_HOMEPAGE_CONTENT));
  }, []);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 3000);
    return () => clearTimeout(t);
  }, [toast]);

  async function handleSave() {
    if (!config) return;
    setSaving(true);
    try {
      const res = await fetch("/api/homepage", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(config),
      });
      if (!res.ok) throw new Error("Save failed");
      setToast({ type: "success", message: "Homepage saved!" });
    } catch {
      setToast({ type: "error", message: "Failed to save. Try again." });
    } finally {
      setSaving(false);
    }
  }

  function setHero(patch: Partial<HomepageContent["hero"]>) {
    setConfig((c) => c ? { ...c, hero: { ...c.hero, ...patch } } : c);
  }
  function setServices(patch: Partial<HomepageContent["services"]>) {
    setConfig((c) => c ? { ...c, services: { ...c.services, ...patch } } : c);
  }
  function setParsley(patch: Partial<HomepageContent["parsley"]>) {
    setConfig((c) => c ? { ...c, parsley: { ...c.parsley, ...patch } } : c);
  }
  function setAr(patch: Partial<HomepageContent["ar"]>) {
    setConfig((c) => c ? { ...c, ar: { ...c.ar, ...patch } } : c);
  }
  function setShowcase(patch: Partial<HomepageContent["showcase"]>) {
    setConfig((c) => c ? { ...c, showcase: { ...c.showcase, ...patch } } : c);
  }
  function setProcess(patch: Partial<HomepageContent["process"]>) {
    setConfig((c) => c ? { ...c, process: { ...c.process, ...patch } } : c);
  }
  function setCta(patch: Partial<HomepageContent["cta"]>) {
    setConfig((c) => c ? { ...c, cta: { ...c.cta, ...patch } } : c);
  }
  function setContact(patch: Partial<HomepageContent["contact"]>) {
    setConfig((c) => c ? { ...c, contact: { ...c.contact, ...patch } } : c);
  }

  if (!config) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-red-600 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-6 py-8">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Homepage Editor</h1>
          <p className="mt-1 text-sm text-gray-500">Edit every section of your Crystal Studios homepage</p>
        </div>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => { if (confirm("Reset all content to defaults?")) setConfig(DEFAULT_HOMEPAGE_CONTENT); }}
            className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50"
          >
            Reset to Defaults
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="rounded-lg bg-red-600 px-5 py-2 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-50"
          >
            {saving ? "Saving…" : "Save Homepage"}
          </button>
        </div>
      </div>

      {/* Toast */}
      {toast && (
        <div className={`mb-6 rounded-lg px-4 py-3 text-sm font-medium ${
          toast.type === "success" ? "bg-green-50 text-green-700 border border-green-200" : "bg-red-50 text-red-700 border border-red-200"
        }`}>
          {toast.message}
        </div>
      )}

      <div className="space-y-4">
        {/* ── HERO ── */}
        <SectionCard title="Hero Section" defaultOpen>
          <div>
            <Label>Badge text (top pill)</Label>
            <input className={inputClass} value={config.hero.badge} onChange={(e) => setHero({ badge: e.target.value })} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Headline (before highlight)</Label>
              <input className={inputClass} value={config.hero.headline} onChange={(e) => setHero({ headline: e.target.value })} />
            </div>
            <div>
              <Label>Highlighted word(s)</Label>
              <input className={inputClass} value={config.hero.highlight} onChange={(e) => setHero({ highlight: e.target.value })} />
            </div>
          </div>
          <div>
            <Label>Subtext paragraph</Label>
            <textarea className={textareaClass} rows={3} value={config.hero.subtext} onChange={(e) => setHero({ subtext: e.target.value })} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Primary CTA button text</Label>
              <input className={inputClass} value={config.hero.cta1Text} onChange={(e) => setHero({ cta1Text: e.target.value })} />
            </div>
            <div>
              <Label>Secondary CTA button text</Label>
              <input className={inputClass} value={config.hero.cta2Text} onChange={(e) => setHero({ cta2Text: e.target.value })} />
            </div>
          </div>
          <div>
            <Label>Hero image URL</Label>
            <input className={inputClass} value={config.hero.heroImageUrl} onChange={(e) => setHero({ heroImageUrl: cleanUrl(e.target.value) })} placeholder="/images/hero-person.png" />
          </div>
        </SectionCard>

        {/* ── SERVICES ── */}
        <SectionCard title="Services Section">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Eyebrow text</Label>
              <input className={inputClass} value={config.services.eyebrow} onChange={(e) => setServices({ eyebrow: e.target.value })} />
            </div>
            <div>
              <Label>Highlighted word(s)</Label>
              <input className={inputClass} value={config.services.highlight} onChange={(e) => setServices({ highlight: e.target.value })} />
            </div>
          </div>
          <div>
            <Label>Headline (before highlight)</Label>
            <input className={inputClass} value={config.services.headline} onChange={(e) => setServices({ headline: e.target.value })} />
          </div>

          <div className="mt-2 space-y-6">
            {config.services.items.map((item, i) => (
              <div key={i} className="rounded-lg border border-gray-100 bg-gray-50 p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-gray-700">Service {i + 1}</span>
                  <button
                    type="button"
                    onClick={() => {
                      const items = config.services.items.filter((_, idx) => idx !== i);
                      setServices({ items });
                    }}
                    className="text-xs text-red-500 hover:text-red-700"
                  >
                    Remove
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label>Tag</Label>
                    <input className={inputClass} value={item.tag} onChange={(e) => {
                      const items = [...config.services.items];
                      items[i] = { ...items[i], tag: e.target.value };
                      setServices({ items });
                    }} />
                  </div>
                  <div>
                    <Label>Title</Label>
                    <input className={inputClass} value={item.title} onChange={(e) => {
                      const items = [...config.services.items];
                      items[i] = { ...items[i], title: e.target.value };
                      setServices({ items });
                    }} />
                  </div>
                </div>
                <div>
                  <Label>Description</Label>
                  <textarea className={textareaClass} rows={2} value={item.description} onChange={(e) => {
                    const items = [...config.services.items];
                    items[i] = { ...items[i], description: e.target.value };
                    setServices({ items });
                  }} />
                </div>
                <div>
                  <Label>Image URL</Label>
                  <input className={inputClass} value={item.imageUrl} onChange={(e) => {
                    const items = [...config.services.items];
                    items[i] = { ...items[i], imageUrl: e.target.value };
                    setServices({ items });
                  }} />
                </div>
              </div>
            ))}
            <button
              type="button"
              onClick={() => setServices({
                items: [...config.services.items, { tag: "New", title: "New Service", description: "", imageUrl: "" }],
              })}
              className="w-full rounded-lg border-2 border-dashed border-gray-200 py-3 text-sm font-medium text-gray-500 hover:border-red-300 hover:text-red-600"
            >
              + Add Service
            </button>
          </div>
        </SectionCard>

        {/* ── PARSLEY PLATFORM ── */}
        <SectionCard title="Parsley Platform Section">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Eyebrow text</Label>
              <input className={inputClass} value={config.parsley.eyebrow} onChange={(e) => setParsley({ eyebrow: e.target.value })} />
            </div>
            <div>
              <Label>Highlighted platform name</Label>
              <input className={inputClass} value={config.parsley.highlight} onChange={(e) => setParsley({ highlight: e.target.value })} />
            </div>
          </div>
          <div>
            <Label>Headline (before highlight)</Label>
            <input className={inputClass} value={config.parsley.headline} onChange={(e) => setParsley({ headline: e.target.value })} />
          </div>
          <div>
            <Label>Paragraph 1</Label>
            <textarea className={textareaClass} rows={3} value={config.parsley.para1} onChange={(e) => setParsley({ para1: e.target.value })} />
          </div>
          <div>
            <Label>Paragraph 2</Label>
            <textarea className={textareaClass} rows={3} value={config.parsley.para2} onChange={(e) => setParsley({ para2: e.target.value })} />
          </div>
          <div>
            <Label>Feature bullets</Label>
            <div className="space-y-3 mt-1">
              {config.parsley.features.map((f, i) => (
                <div key={i} className="rounded-lg border border-gray-100 bg-gray-50 p-3 space-y-2">
                  <div className="flex gap-3">
                    <div className="flex-1">
                      <input className={inputClass} placeholder="Title" value={f.title} onChange={(e) => {
                        const features = [...config.parsley.features];
                        features[i] = { ...features[i], title: e.target.value };
                        setParsley({ features });
                      }} />
                    </div>
                    <button type="button" onClick={() => {
                      const features = config.parsley.features.filter((_, idx) => idx !== i);
                      setParsley({ features });
                    }} className="text-xs text-red-500 hover:text-red-700 whitespace-nowrap">Remove</button>
                  </div>
                  <input className={inputClass} placeholder="Description" value={f.desc} onChange={(e) => {
                    const features = [...config.parsley.features];
                    features[i] = { ...features[i], desc: e.target.value };
                    setParsley({ features });
                  }} />
                </div>
              ))}
              <button
                type="button"
                onClick={() => setParsley({ features: [...config.parsley.features, { title: "", desc: "" }] })}
                className="w-full rounded-lg border-2 border-dashed border-gray-200 py-2 text-sm text-gray-500 hover:border-red-300 hover:text-red-600"
              >
                + Add Feature
              </button>
            </div>
          </div>
        </SectionCard>

        {/* ── 3D / AR ── */}
        <SectionCard title="3D & AR Section">
          <div>
            <Label>Badge text</Label>
            <input className={inputClass} value={config.ar.badge} onChange={(e) => setAr({ badge: e.target.value })} />
          </div>
          <div>
            <Label>Headline (before highlights)</Label>
            <input className={inputClass} value={config.ar.headline} onChange={(e) => setAr({ headline: e.target.value })} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Highlight 1 (e.g. "3D on the web")</Label>
              <input className={inputClass} value={config.ar.highlight1} onChange={(e) => setAr({ highlight1: e.target.value })} />
            </div>
            <div>
              <Label>Highlight 2 (e.g. "AR on iOS")</Label>
              <input className={inputClass} value={config.ar.highlight2} onChange={(e) => setAr({ highlight2: e.target.value })} />
            </div>
          </div>
          <div>
            <Label>Paragraph 1</Label>
            <textarea className={textareaClass} rows={3} value={config.ar.para1} onChange={(e) => setAr({ para1: e.target.value })} />
          </div>
          <div>
            <Label>Paragraph 2</Label>
            <textarea className={textareaClass} rows={3} value={config.ar.para2} onChange={(e) => setAr({ para2: e.target.value })} />
          </div>
          <div>
            <Label>Tech tags (one per line)</Label>
            <textarea
              className={textareaClass}
              rows={4}
              value={config.ar.tags.join("\n")}
              onChange={(e) => setAr({ tags: e.target.value.split("\n").filter(Boolean) })}
            />
          </div>
        </SectionCard>

        {/* ── SHOWCASE / WORK ── */}
        <SectionCard title="Showcase / Work Section">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Eyebrow text</Label>
              <input className={inputClass} value={config.showcase.eyebrow} onChange={(e) => setShowcase({ eyebrow: e.target.value })} />
            </div>
            <div>
              <Label>Headline</Label>
              <input className={inputClass} value={config.showcase.headline} onChange={(e) => setShowcase({ headline: e.target.value })} />
            </div>
          </div>
          <div className="space-y-4 mt-2">
            {config.showcase.items.map((item, i) => (
              <div key={i} className="rounded-lg border border-gray-100 bg-gray-50 p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-gray-700">Project {i + 1}</span>
                  <button
                    type="button"
                    onClick={() => setShowcase({ items: config.showcase.items.filter((_, idx) => idx !== i) })}
                    className="text-xs text-red-500 hover:text-red-700"
                  >
                    Remove
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label>Tag</Label>
                    <input className={inputClass} value={item.tag} onChange={(e) => {
                      const items = [...config.showcase.items];
                      items[i] = { ...items[i], tag: e.target.value };
                      setShowcase({ items });
                    }} />
                  </div>
                  <div>
                    <Label>Title</Label>
                    <input className={inputClass} value={item.title} onChange={(e) => {
                      const items = [...config.showcase.items];
                      items[i] = { ...items[i], title: e.target.value };
                      setShowcase({ items });
                    }} />
                  </div>
                </div>
                <div>
                  <Label>Description</Label>
                  <textarea className={textareaClass} rows={2} value={item.description} onChange={(e) => {
                    const items = [...config.showcase.items];
                    items[i] = { ...items[i], description: e.target.value };
                    setShowcase({ items });
                  }} />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label>Link URL</Label>
                    <input className={inputClass} value={item.href} onChange={(e) => {
                      const items = [...config.showcase.items];
                      items[i] = { ...items[i], href: e.target.value };
                      setShowcase({ items });
                    }} />
                  </div>
                  <div>
                    <Label>Image URL</Label>
                    <input className={inputClass} value={item.imageUrl} onChange={(e) => {
                      const items = [...config.showcase.items];
                      items[i] = { ...items[i], imageUrl: cleanUrl(e.target.value) };
                      setShowcase({ items });
                    }} placeholder="https://... or /images/filename.png" />
                  </div>
                </div>
              </div>
            ))}
            <button
              type="button"
              onClick={() => setShowcase({
                items: [...config.showcase.items, { tag: "", title: "", description: "", href: "", imageUrl: "" }],
              })}
              className="w-full rounded-lg border-2 border-dashed border-gray-200 py-3 text-sm font-medium text-gray-500 hover:border-red-300 hover:text-red-600"
            >
              + Add Project
            </button>
          </div>
        </SectionCard>

        {/* ── PROCESS ── */}
        <SectionCard title="Process Section">
          <div>
            <Label>Eyebrow text</Label>
            <input className={inputClass} value={config.process.eyebrow} onChange={(e) => setProcess({ eyebrow: e.target.value })} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Headline (before highlight)</Label>
              <input className={inputClass} value={config.process.headline} onChange={(e) => setProcess({ headline: e.target.value })} />
            </div>
            <div>
              <Label>Highlighted phrase</Label>
              <input className={inputClass} value={config.process.highlight} onChange={(e) => setProcess({ highlight: e.target.value })} />
            </div>
          </div>
          <div className="space-y-3 mt-2">
            {config.process.steps.map((step, i) => (
              <div key={i} className="rounded-lg border border-gray-100 bg-gray-50 p-4 space-y-2">
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <Label>Step #</Label>
                    <input className={inputClass} value={step.step} onChange={(e) => {
                      const steps = [...config.process.steps];
                      steps[i] = { ...steps[i], step: e.target.value };
                      setProcess({ steps });
                    }} />
                  </div>
                  <div className="col-span-2">
                    <Label>Title</Label>
                    <input className={inputClass} value={step.title} onChange={(e) => {
                      const steps = [...config.process.steps];
                      steps[i] = { ...steps[i], title: e.target.value };
                      setProcess({ steps });
                    }} />
                  </div>
                </div>
                <div>
                  <Label>Description</Label>
                  <textarea className={textareaClass} rows={2} value={step.description} onChange={(e) => {
                    const steps = [...config.process.steps];
                    steps[i] = { ...steps[i], description: e.target.value };
                    setProcess({ steps });
                  }} />
                </div>
              </div>
            ))}
          </div>
        </SectionCard>

        {/* ── CTA ── */}
        <SectionCard title="CTA Section">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Headline (before highlight)</Label>
              <input className={inputClass} value={config.cta.headline} onChange={(e) => setCta({ headline: e.target.value })} />
            </div>
            <div>
              <Label>Highlighted word(s)</Label>
              <input className={inputClass} value={config.cta.highlight} onChange={(e) => setCta({ highlight: e.target.value })} />
            </div>
          </div>
          <div>
            <Label>Subtext</Label>
            <textarea className={textareaClass} rows={2} value={config.cta.subtext} onChange={(e) => setCta({ subtext: e.target.value })} />
          </div>
        </SectionCard>

        {/* ── CONTACT ── */}
        <SectionCard title="Contact / Form Settings">
          <div>
            <Label>Notification email (receives form submissions)</Label>
            <input
              type="email"
              className={inputClass}
              value={config.contact.email}
              onChange={(e) => setContact({ email: e.target.value })}
              placeholder="you@example.com"
            />
          </div>
        </SectionCard>
      </div>

      {/* Sticky save bar */}
      <div className="mt-8 flex items-center justify-end gap-4 border-t border-gray-100 pt-6">
        <button
          type="button"
          onClick={() => { if (confirm("Reset all content to defaults?")) setConfig(DEFAULT_HOMEPAGE_CONTENT); }}
          className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50"
        >
          Reset to Defaults
        </button>
        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="rounded-lg bg-red-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-50"
        >
          {saving ? "Saving…" : "Save Homepage"}
        </button>
      </div>
    </div>
  );
}
