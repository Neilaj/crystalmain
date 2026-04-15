"use client";

import { useState, useEffect, useCallback } from "react";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
  arrayMove,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

// ─── Types ────────────────────────────────────────────────────────────────────
interface VideoItem {
  id: number;
  src: string;
  title: string;
  label: string;
  accent: string;
}

interface BenefitItem {
  id: number;
  title: string;
  body: string;
}

interface ProcessStep {
  id: number;
  step: string;
  title: string;
  body: string;
}

interface AIVideoContent {
  hero: {
    badge: string;
    headline: string;
    subtext: string;
    stat1value: string; stat1label: string;
    stat2value: string; stat2label: string;
    stat3value: string; stat3label: string;
    stat4value: string; stat4label: string;
  };
  showcase: { headline: string; subheadline: string };
  videos: VideoItem[];
  benefits: BenefitItem[];
  process: { headline: string; subheadline: string; steps: ProcessStep[] };
  cta: { headline: string; subtext: string; buttonText: string };
}

// ─── Default content (mirrors the hardcoded page) ────────────────────────────
const DEFAULT: AIVideoContent = {
  hero: {
    badge: "AI-Powered Video Production",
    headline: "Stop the Scroll. Start Converting.",
    subtext: "We produce AI-generated video content that stops thumbs mid-scroll, builds brand authority, and drives real business results — on every platform your customers live on.",
    stat1value: "3×",  stat1label: "Higher Engagement",
    stat2value: "10×", stat2label: "Faster Than Traditional",
    stat3value: "6+",  stat3label: "Platform Formats",
    stat4value: "48h", stat4label: "Revision Turnaround",
  },
  showcase: {
    headline: "Real AI Videos. Real Results.",
    subheadline: "Hover to preview · Click to watch full screen",
  },
  videos: [
    { id: 1,  src: "/videos/BabyAd-Fin.mp4",                  title: "Baby Brand Ad",          label: "Instagram Reel",   accent: "from-pink-500 to-rose-400" },
    { id: 2,  src: "/videos/Camaro-Website-Fin.mp4",           title: "Automotive Showcase",    label: "YouTube Shorts",   accent: "from-red-600 to-orange-500" },
    { id: 3,  src: "/videos/CamaroTransformer-Final.mp4",      title: "Camaro Transformer",     label: "TikTok",           accent: "from-gray-600 to-slate-500" },
    { id: 4,  src: "/videos/CamaroTune-Final.mp4",             title: "Performance Tuning",     label: "Facebook Reel",    accent: "from-amber-500 to-yellow-400" },
    { id: 5,  src: "/videos/Cleaning-WomenFinal-01-05-26.mp4", title: "Cleaning Service Ad",    label: "Instagram Reel",   accent: "from-emerald-500 to-teal-400" },
    { id: 6,  src: "/videos/Cran-Snow-Fin.mp4",                title: "Winter Scene",           label: "Multi-Platform",   accent: "from-blue-500 to-cyan-400" },
    { id: 7,  src: "/videos/Cry-Drining-Main-St.mp4",          title: "Crystal Studios Brand",  label: "Brand Reel",       accent: "from-red-700 to-rose-500" },
    { id: 8,  src: "/videos/Fin-Spring-Cleanup.mp4",           title: "Spring Cleanup",         label: "Local Service Ad", accent: "from-green-500 to-emerald-400" },
    { id: 9,  src: "/videos/Fin-couple-snowstorm.mp4",         title: "Storm Response",         label: "Facebook Reel",    accent: "from-indigo-500 to-blue-400" },
    { id: 10, src: "/videos/Sales-Vid-01-12-29-25.mp4",        title: "Sales Campaign",         label: "Multi-Platform",   accent: "from-purple-600 to-violet-400" },
    { id: 11, src: "/videos/Web-SM-Marketing-01-07-26.mp4",    title: "Web & Social Marketing", label: "YouTube Shorts",   accent: "from-fuchsia-500 to-pink-400" },
  ],
  benefits: [
    { id: 1, title: "10x Faster Production",      body: "Traditional video production takes weeks and tens of thousands of dollars. AI video gets you scroll-stopping content in days — at a fraction of the cost." },
    { id: 2, title: "3× Higher Engagement",       body: "Video content generates 3× more engagement than static posts. AI-produced videos are crafted to hook viewers in the first 3 seconds — where attention is won or lost." },
    { id: 3, title: "Always On-Brand",            body: "Every video is built around your brand colors, voice, and message. No generic stock footage — every frame is made for your business." },
    { id: 4, title: "Built for Every Platform",   body: "One shoot, every format. We deliver vertical 9:16 for Reels and TikTok, square 1:1 for feed posts, and 16:9 for YouTube — all from the same production." },
    { id: 5, title: "AI Voices & Presenters",     body: "Realistic AI narration and on-screen presenters mean you never need to be on camera. Your brand speaks — professionally — 24/7." },
    { id: 6, title: "Fast Turnaround on Changes", body: "Need to update the offer, swap a visual, or tweak the script? AI production means revisions that took weeks with traditional video are done in 24–48 hours." },
  ],
  process: {
    headline: "How It Works",
    subheadline: "From brief to published in days, not months.",
    steps: [
      { id: 1, step: "01", title: "Strategy Call",     body: "We learn your brand, your audience, and what you want people to do after watching. 30 minutes — that's all we need." },
      { id: 2, step: "02", title: "Script & Storyboard", body: "Our team writes a punchy, platform-native script and storyboards every scene. You approve before a single frame is rendered." },
      { id: 3, step: "03", title: "AI Production",     body: "We run your project through our AI production pipeline — visuals, voiceover, music, captions, and cuts all dialed in for maximum retention." },
      { id: 4, step: "04", title: "Review & Deliver",  body: "You get every format you need: 9:16, 1:1, 16:9. We deliver production-ready files and post-ready captions." },
    ],
  },
  cta: {
    headline: "Ready to Stop Being Invisible Online?",
    subtext: "Your competitors are already posting video. The question is whether they'll keep outranking you — or whether you'll leapfrog them with AI-powered content that actually converts.",
    buttonText: "Start My AI Video Project",
  },
};

// ─── Drag handle icon ─────────────────────────────────────────────────────────
function DragHandle() {
  return (
    <svg className="h-5 w-5 text-gray-400 cursor-grab active:cursor-grabbing flex-shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 9h16.5m-16.5 6.75h16.5" />
    </svg>
  );
}

// ─── Sortable Video Row ───────────────────────────────────────────────────────
function SortableVideoRow({
  video,
  onChange,
  onDelete,
}: {
  video: VideoItem;
  onChange: (id: number, field: keyof VideoItem, value: string) => void;
  onDelete: (id: number) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: video.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex items-start gap-3 rounded-xl border border-gray-200 bg-white p-4 shadow-sm"
    >
      <div {...attributes} {...listeners} className="mt-1">
        <DragHandle />
      </div>

      <div className="flex-1 grid grid-cols-1 gap-2 sm:grid-cols-3">
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Title</label>
          <input
            value={video.title}
            onChange={(e) => onChange(video.id, "title", e.target.value)}
            className="w-full rounded-lg border border-gray-200 px-3 py-1.5 text-sm focus:border-red-400 focus:outline-none focus:ring-1 focus:ring-red-400"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Platform Label</label>
          <input
            value={video.label}
            onChange={(e) => onChange(video.id, "label", e.target.value)}
            className="w-full rounded-lg border border-gray-200 px-3 py-1.5 text-sm focus:border-red-400 focus:outline-none focus:ring-1 focus:ring-red-400"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">File (in /videos/)</label>
          <input
            value={video.src}
            onChange={(e) => onChange(video.id, "src", e.target.value)}
            className="w-full rounded-lg border border-gray-200 px-3 py-1.5 text-sm font-mono focus:border-red-400 focus:outline-none focus:ring-1 focus:ring-red-400"
          />
        </div>
      </div>

      <button
        onClick={() => onDelete(video.id)}
        className="mt-1 rounded-lg p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-500 transition-colors flex-shrink-0"
        title="Remove video"
      >
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
}

// ─── Sortable Benefit Row ─────────────────────────────────────────────────────
function SortableBenefitRow({
  benefit,
  onChange,
  onDelete,
}: {
  benefit: BenefitItem;
  onChange: (id: number, field: keyof BenefitItem, value: string) => void;
  onDelete: (id: number) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: benefit.id });

  const style = { transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.5 : 1 };

  return (
    <div ref={setNodeRef} style={style} className="flex items-start gap-3 rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
      <div {...attributes} {...listeners} className="mt-1"><DragHandle /></div>
      <div className="flex-1 grid grid-cols-1 gap-2 sm:grid-cols-2">
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Title</label>
          <input value={benefit.title} onChange={(e) => onChange(benefit.id, "title", e.target.value)}
            className="w-full rounded-lg border border-gray-200 px-3 py-1.5 text-sm focus:border-red-400 focus:outline-none focus:ring-1 focus:ring-red-400" />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Body text</label>
          <textarea value={benefit.body} onChange={(e) => onChange(benefit.id, "body", e.target.value)} rows={2}
            className="w-full rounded-lg border border-gray-200 px-3 py-1.5 text-sm focus:border-red-400 focus:outline-none focus:ring-1 focus:ring-red-400 resize-none" />
        </div>
      </div>
      <button onClick={() => onDelete(benefit.id)} className="mt-1 rounded-lg p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-500 transition-colors flex-shrink-0">
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" /></svg>
      </button>
    </div>
  );
}

// ─── Sortable Step Row ────────────────────────────────────────────────────────
function SortableStepRow({
  step,
  index,
  onChange,
  onDelete,
}: {
  step: ProcessStep;
  index: number;
  onChange: (id: number, field: keyof ProcessStep, value: string) => void;
  onDelete: (id: number) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: step.id });

  const style = { transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.5 : 1 };

  return (
    <div ref={setNodeRef} style={style} className="flex items-start gap-3 rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
      <div {...attributes} {...listeners} className="mt-1"><DragHandle /></div>
      <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-red-100 text-xs font-black text-red-700">
        {String(index + 1).padStart(2, "0")}
      </div>
      <div className="flex-1 grid grid-cols-1 gap-2 sm:grid-cols-2">
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Title</label>
          <input value={step.title} onChange={(e) => onChange(step.id, "title", e.target.value)}
            className="w-full rounded-lg border border-gray-200 px-3 py-1.5 text-sm focus:border-red-400 focus:outline-none focus:ring-1 focus:ring-red-400" />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Description</label>
          <textarea value={step.body} onChange={(e) => onChange(step.id, "body", e.target.value)} rows={2}
            className="w-full rounded-lg border border-gray-200 px-3 py-1.5 text-sm focus:border-red-400 focus:outline-none focus:ring-1 focus:ring-red-400 resize-none" />
        </div>
      </div>
      <button onClick={() => onDelete(step.id)} className="mt-1 rounded-lg p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-500 transition-colors flex-shrink-0">
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" /></svg>
      </button>
    </div>
  );
}

// ─── Section wrapper ──────────────────────────────────────────────────────────
function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-gray-50 p-6">
      <h2 className="mb-4 text-base font-bold text-gray-800">{title}</h2>
      {children}
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="mb-1 block text-xs font-medium text-gray-500">{label}</label>
      {children}
    </div>
  );
}

const INPUT = "w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm focus:border-red-400 focus:outline-none focus:ring-1 focus:ring-red-400";
const TEXTAREA = INPUT + " resize-none";

// ─── Main editor ──────────────────────────────────────────────────────────────
export default function AIVideoAdminPage() {
  const [data, setData] = useState<AIVideoContent>(DEFAULT);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

  // Load from DB
  useEffect(() => {
    fetch("/api/ai-video")
      .then((r) => r.json())
      .then((d) => { if (d && !d.error) setData({ ...DEFAULT, ...d }); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const save = useCallback(async () => {
    setSaving(true);
    try {
      await fetch("/api/ai-video", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } finally {
      setSaving(false);
    }
  }, [data]);

  const setHero = (field: string, value: string) =>
    setData((d) => ({ ...d, hero: { ...d.hero, [field]: value } }));

  // ── Video DnD ────────────────────────────────────────────────────────────
  const handleVideoDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      setData((d) => {
        const oldIdx = d.videos.findIndex((v) => v.id === active.id);
        const newIdx = d.videos.findIndex((v) => v.id === over.id);
        return { ...d, videos: arrayMove(d.videos, oldIdx, newIdx) };
      });
    }
  };

  const updateVideo = (id: number, field: keyof VideoItem, value: string) =>
    setData((d) => ({ ...d, videos: d.videos.map((v) => v.id === id ? { ...v, [field]: value } : v) }));

  const deleteVideo = (id: number) =>
    setData((d) => ({ ...d, videos: d.videos.filter((v) => v.id !== id) }));

  const addVideo = () =>
    setData((d) => ({
      ...d,
      videos: [...d.videos, { id: Date.now(), src: "/videos/", title: "New Video", label: "Instagram Reel", accent: "from-red-600 to-rose-500" }],
    }));

  // ── Benefit DnD ──────────────────────────────────────────────────────────
  const handleBenefitDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      setData((d) => {
        const oldIdx = d.benefits.findIndex((b) => b.id === active.id);
        const newIdx = d.benefits.findIndex((b) => b.id === over.id);
        return { ...d, benefits: arrayMove(d.benefits, oldIdx, newIdx) };
      });
    }
  };

  const updateBenefit = (id: number, field: keyof BenefitItem, value: string) =>
    setData((d) => ({ ...d, benefits: d.benefits.map((b) => b.id === id ? { ...b, [field]: value } : b) }));

  const deleteBenefit = (id: number) =>
    setData((d) => ({ ...d, benefits: d.benefits.filter((b) => b.id !== id) }));

  const addBenefit = () =>
    setData((d) => ({
      ...d,
      benefits: [...d.benefits, { id: Date.now(), title: "New Benefit", body: "Describe this benefit." }],
    }));

  // ── Step DnD ─────────────────────────────────────────────────────────────
  const handleStepDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      setData((d) => {
        const steps = d.process.steps;
        const oldIdx = steps.findIndex((s) => s.id === active.id);
        const newIdx = steps.findIndex((s) => s.id === over.id);
        return { ...d, process: { ...d.process, steps: arrayMove(steps, oldIdx, newIdx) } };
      });
    }
  };

  const updateStep = (id: number, field: keyof ProcessStep, value: string) =>
    setData((d) => ({ ...d, process: { ...d.process, steps: d.process.steps.map((s) => s.id === id ? { ...s, [field]: value } : s) } }));

  const deleteStep = (id: number) =>
    setData((d) => ({ ...d, process: { ...d.process, steps: d.process.steps.filter((s) => s.id !== id) } }));

  const addStep = () =>
    setData((d) => ({
      ...d,
      process: {
        ...d.process,
        steps: [...d.process.steps, { id: Date.now(), step: String(d.process.steps.length + 1).padStart(2, "0"), title: "New Step", body: "Describe this step." }],
      },
    }));

  if (loading) {
    return <div className="p-8 text-gray-400">Loading...</div>;
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">AI Video Page</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Editing <span className="font-mono text-xs bg-gray-100 px-1.5 py-0.5 rounded">/ai-video-production</span>
          </p>
        </div>
        <div className="flex items-center gap-3">
          <a href="/ai-video-production" target="_blank"
            className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors">
            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 0 0 3 8.25v10.5A2.25 2.25 0 0 0 5.25 21h10.5A2.25 2.25 0 0 0 18 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
            </svg>
            Preview
          </a>
          <button
            onClick={save}
            disabled={saving}
            className={`inline-flex items-center gap-2 rounded-lg px-5 py-2 text-sm font-semibold text-white transition-all ${
              saved ? "bg-green-600" : "bg-red-600 hover:bg-red-500"
            } disabled:opacity-60`}
          >
            {saving ? "Saving..." : saved ? "✓ Saved!" : "Save Changes"}
          </button>
        </div>
      </div>

      {/* ── Hero ── */}
      <Section title="🎬 Hero Section">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Badge text">
            <input value={data.hero.badge} onChange={(e) => setHero("badge", e.target.value)} className={INPUT} />
          </Field>
          <Field label="Headline">
            <input value={data.hero.headline} onChange={(e) => setHero("headline", e.target.value)} className={INPUT} />
          </Field>
          <Field label="Subtext" >
            <textarea value={data.hero.subtext} onChange={(e) => setHero("subtext", e.target.value)} rows={3} className={TEXTAREA} />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            {(["1","2","3","4"] as const).map((n) => (
              <div key={n} className="space-y-1">
                <label className="block text-xs font-medium text-gray-500">Stat {n}</label>
                <input placeholder="Value" value={(data.hero as Record<string, string>)[`stat${n}value`]}
                  onChange={(e) => setHero(`stat${n}value`, e.target.value)}
                  className="w-full rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-sm focus:border-red-400 focus:outline-none" />
                <input placeholder="Label" value={(data.hero as Record<string, string>)[`stat${n}label`]}
                  onChange={(e) => setHero(`stat${n}label`, e.target.value)}
                  className="w-full rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-sm focus:border-red-400 focus:outline-none" />
              </div>
            ))}
          </div>
        </div>
      </Section>

      {/* ── Videos ── */}
      <Section title="🎥 Videos — drag to reorder">
        <p className="mb-3 text-xs text-gray-500">
          Files must be uploaded to <span className="font-mono bg-gray-100 px-1 py-0.5 rounded">public/videos/</span> in the codebase. Use the exact filename including extension.
        </p>
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleVideoDragEnd}>
          <SortableContext items={data.videos.map((v) => v.id)} strategy={verticalListSortingStrategy}>
            <div className="space-y-3">
              {data.videos.map((video) => (
                <SortableVideoRow key={video.id} video={video} onChange={updateVideo} onDelete={deleteVideo} />
              ))}
            </div>
          </SortableContext>
        </DndContext>
        <button onClick={addVideo}
          className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-gray-200 py-3 text-sm font-medium text-gray-500 hover:border-red-300 hover:text-red-600 transition-colors">
          + Add Video
        </button>
      </Section>

      {/* ── Benefits ── */}
      <Section title="✅ Why AI Video — Benefits">
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleBenefitDragEnd}>
          <SortableContext items={data.benefits.map((b) => b.id)} strategy={verticalListSortingStrategy}>
            <div className="space-y-3">
              {data.benefits.map((b) => (
                <SortableBenefitRow key={b.id} benefit={b} onChange={updateBenefit} onDelete={deleteBenefit} />
              ))}
            </div>
          </SortableContext>
        </DndContext>
        <button onClick={addBenefit}
          className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-gray-200 py-3 text-sm font-medium text-gray-500 hover:border-red-300 hover:text-red-600 transition-colors">
          + Add Benefit
        </button>
      </Section>

      {/* ── Process ── */}
      <Section title="⚙️ How It Works — Process Steps">
        <div className="mb-4 grid gap-3 sm:grid-cols-2">
          <Field label="Section headline">
            <input value={data.process.headline} onChange={(e) => setData((d) => ({ ...d, process: { ...d.process, headline: e.target.value } }))} className={INPUT} />
          </Field>
          <Field label="Subheadline">
            <input value={data.process.subheadline} onChange={(e) => setData((d) => ({ ...d, process: { ...d.process, subheadline: e.target.value } }))} className={INPUT} />
          </Field>
        </div>
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleStepDragEnd}>
          <SortableContext items={data.process.steps.map((s) => s.id)} strategy={verticalListSortingStrategy}>
            <div className="space-y-3">
              {data.process.steps.map((s, i) => (
                <SortableStepRow key={s.id} step={s} index={i} onChange={updateStep} onDelete={deleteStep} />
              ))}
            </div>
          </SortableContext>
        </DndContext>
        <button onClick={addStep}
          className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-gray-200 py-3 text-sm font-medium text-gray-500 hover:border-red-300 hover:text-red-600 transition-colors">
          + Add Step
        </button>
      </Section>

      {/* ── CTA ── */}
      <Section title="📣 Call to Action">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Headline">
            <input value={data.cta.headline} onChange={(e) => setData((d) => ({ ...d, cta: { ...d.cta, headline: e.target.value } }))} className={INPUT} />
          </Field>
          <Field label="Button text">
            <input value={data.cta.buttonText} onChange={(e) => setData((d) => ({ ...d, cta: { ...d.cta, buttonText: e.target.value } }))} className={INPUT} />
          </Field>
          <Field label="Subtext">
            <textarea value={data.cta.subtext} onChange={(e) => setData((d) => ({ ...d, cta: { ...d.cta, subtext: e.target.value } }))} rows={3} className={TEXTAREA} />
          </Field>
        </div>
      </Section>

      {/* Floating save */}
      <div className="sticky bottom-6 flex justify-end">
        <button onClick={save} disabled={saving}
          className={`rounded-full px-8 py-3 text-sm font-semibold text-white shadow-xl transition-all ${saved ? "bg-green-600" : "bg-red-600 hover:bg-red-500"} disabled:opacity-60`}>
          {saving ? "Saving..." : saved ? "✓ Saved!" : "Save Changes"}
        </button>
      </div>
    </div>
  );
}
