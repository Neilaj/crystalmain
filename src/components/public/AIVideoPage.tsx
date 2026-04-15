"use client";

import { useState, useRef, useEffect } from "react";
import SiteHeader from "./SiteHeader";
import SiteFooter from "./SiteFooter";
import AskChrissy from "./AskChrissy";
import Link from "next/link";

interface NavItem {
  id: string;
  label: string;
  url: string;
  location: string;
  openNew: boolean;
}

interface AIVideoPageProps {
  siteLogo?: string | null;
  navigation?: NavItem[];
}

// ─── Video data ───────────────────────────────────────────────────────────────
const VIDEOS = [
  { id: 1,  src: "/videos/BabyAd-Fin.mp4",                    title: "Baby Brand Ad",          label: "Instagram Reel",    accent: "from-pink-500 to-rose-400" },
  { id: 2,  src: "/videos/Camaro-Website-Fin.mp4",             title: "Automotive Showcase",    label: "YouTube Shorts",    accent: "from-red-600 to-orange-500" },
  { id: 3,  src: "/videos/CamaroTransformer-Final.mp4",        title: "Camaro Transformer",     label: "TikTok",            accent: "from-gray-600 to-slate-500" },
  { id: 4,  src: "/videos/CamaroTune-Final.mp4",               title: "Performance Tuning",     label: "Facebook Reel",     accent: "from-amber-500 to-yellow-400" },
  { id: 5,  src: "/videos/Cleaning-WomenFinal-01-05-26.mp4",   title: "Cleaning Service Ad",    label: "Instagram Reel",    accent: "from-emerald-500 to-teal-400" },
  { id: 6,  src: "/videos/Cran-Snow-Fin.mp4",                  title: "Winter Scene",           label: "Multi-Platform",    accent: "from-blue-500 to-cyan-400" },
  { id: 7,  src: "/videos/Cry-Drining-Main-St.mp4",            title: "Crystal Studios Brand",  label: "Brand Reel",        accent: "from-red-700 to-rose-500" },
  { id: 8,  src: "/videos/Fin-Spring-Cleanup.mp4",             title: "Spring Cleanup",         label: "Local Service Ad",  accent: "from-green-500 to-emerald-400" },
  { id: 9,  src: "/videos/Fin-couple-snowstorm.mp4",           title: "Storm Response",         label: "Facebook Reel",     accent: "from-indigo-500 to-blue-400" },
  { id: 10, src: "/videos/Sales-Vid-01-12-29-25.mp4",          title: "Sales Campaign",         label: "Multi-Platform",    accent: "from-purple-600 to-violet-400" },
  { id: 11, src: "/videos/Web-SM-Marketing-01-07-26.mp4",      title: "Web & Social Marketing", label: "YouTube Shorts",    accent: "from-fuchsia-500 to-pink-400" },
];

const PLATFORMS = [
  { name: "Instagram", icon: "📸", formats: "Reels · Stories · Feed" },
  { name: "TikTok", icon: "🎵", formats: "Short-form · Trending" },
  { name: "YouTube", icon: "▶️", formats: "Shorts · Ads · Intros" },
  { name: "Facebook", icon: "💬", formats: "Reels · Stories · Ads" },
  { name: "LinkedIn", icon: "💼", formats: "Video Posts · Ads" },
  { name: "X / Twitter", icon: "𝕏", formats: "Video Clips · Ads" },
];

const BENEFITS = [
  {
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
      </svg>
    ),
    title: "10x Faster Production",
    body: "Traditional video production takes weeks and tens of thousands of dollars. AI video gets you scroll-stopping content in days — at a fraction of the cost.",
  },
  {
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18 9 11.25l4.306 4.306a11.95 11.95 0 0 1 5.814-5.518l2.74-1.22m0 0-5.94-2.281m5.94 2.28-2.28 5.941" />
      </svg>
    ),
    title: "3× Higher Engagement",
    body: "Video content generates 3× more engagement than static posts. AI-produced videos are crafted to hook viewers in the first 3 seconds — where attention is won or lost.",
  },
  {
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09Z" />
      </svg>
    ),
    title: "Always On-Brand",
    body: "Every video is built around your brand colors, voice, and message. No generic stock footage — every frame is made for your business.",
  },
  {
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 1.5H8.25A2.25 2.25 0 0 0 6 3.75v16.5a2.25 2.25 0 0 0 2.25 2.25h7.5A2.25 2.25 0 0 0 18 20.25V3.75a2.25 2.25 0 0 0-2.25-2.25H13.5m-3 0V3h3V1.5m-3 0h3m-3 8.25h3m-3 3h3m-3 3h3" />
      </svg>
    ),
    title: "Built for Every Platform",
    body: "One shoot, every format. We deliver vertical 9:16 for Reels and TikTok, square 1:1 for feed posts, and 16:9 for YouTube — all from the same production.",
  },
  {
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
      </svg>
    ),
    title: "AI Voices & Presenters",
    body: "Realistic AI narration and on-screen presenters mean you never need to be on camera. Your brand speaks — professionally — 24/7.",
  },
  {
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99" />
      </svg>
    ),
    title: "Fast Turnaround on Changes",
    body: "Need to update the offer, swap a visual, or tweak the script? AI production means revisions that took weeks with traditional video are done in 24–48 hours.",
  },
];

// ─── Single video card with hover-to-play ────────────────────────────────────
function VideoCard({ video, onClick }: { video: typeof VIDEOS[0]; onClick: () => void }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  const handleMouseEnter = () => {
    videoRef.current?.play().catch(() => {});
  };
  const handleMouseLeave = () => {
    if (videoRef.current) {
      videoRef.current.pause();
      videoRef.current.currentTime = 0;
    }
  };

  return (
    <div
      className="group relative cursor-pointer overflow-hidden rounded-2xl bg-gray-900 aspect-[9/16]"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={onClick}
    >
      {/* Platform badge */}
      <div className={`absolute top-3 left-3 z-10 rounded-full bg-gradient-to-r ${video.accent} px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-white shadow-lg`}>
        {video.label}
      </div>

      {/* Play overlay */}
      <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/30 opacity-100 transition-opacity duration-300 group-hover:opacity-0">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm border border-white/30 transition-transform duration-300 group-hover:scale-110">
          <svg className="h-6 w-6 translate-x-0.5 text-white" fill="currentColor" viewBox="0 0 24 24">
            <path d="M8 5v14l11-7z" />
          </svg>
        </div>
      </div>

      {/* Bottom info */}
      <div className="absolute bottom-0 left-0 right-0 z-10 bg-gradient-to-t from-black/80 to-transparent p-4">
        <p className="text-sm font-semibold text-white">{video.title}</p>
        <p className="text-xs text-gray-400">Click to view full screen</p>
      </div>

      <video
        ref={videoRef}
        src={video.src}
        className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
        muted
        loop
        playsInline
        preload="metadata"
        onLoadedData={() => setIsLoaded(true)}
      />

      {/* Loading shimmer */}
      {!isLoaded && (
        <div className="absolute inset-0 bg-gradient-to-br from-gray-800 to-gray-900 animate-pulse" />
      )}
    </div>
  );
}

// ─── Fullscreen lightbox ──────────────────────────────────────────────────────
function VideoLightbox({ video, onClose }: { video: typeof VIDEOS[0]; onClose: () => void }) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    videoRef.current?.play().catch(() => {});
    const handleKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 backdrop-blur-sm"
      onClick={onClose}
    >
      <button
        className="absolute top-5 right-5 rounded-full bg-white/10 p-2 text-white hover:bg-white/20 transition-colors"
        onClick={onClose}
      >
        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
        </svg>
      </button>

      <div
        className="relative max-h-[90vh] max-w-sm w-full mx-4"
        onClick={(e) => e.stopPropagation()}
      >
        <video
          ref={videoRef}
          src={video.src}
          className="w-full rounded-2xl"
          controls
          playsInline
          autoPlay
        />
        <div className="mt-3 text-center">
          <span className={`inline-block rounded-full bg-gradient-to-r ${video.accent} px-3 py-1 text-xs font-bold uppercase tracking-widest text-white`}>
            {video.label}
          </span>
          <p className="mt-1 text-sm font-semibold text-white">{video.title}</p>
        </div>
      </div>
    </div>
  );
}

export default function AIVideoPage({ siteLogo, navigation = [] }: AIVideoPageProps) {
  const [activeVideo, setActiveVideo] = useState<typeof VIDEOS[0] | null>(null);

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      <SiteHeader siteLogo={siteLogo} navigation={navigation} />

      {/* ── HERO ─────────────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden py-24 lg:py-32">
        {/* Animated background */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 h-[600px] w-[600px] rounded-full bg-gradient-to-br from-red-900/40 to-transparent blur-3xl" />
          <div className="absolute -bottom-40 -left-40 h-[500px] w-[500px] rounded-full bg-gradient-to-tr from-purple-900/30 to-transparent blur-3xl" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[800px] w-[800px] rounded-full bg-gradient-radial from-red-950/20 to-transparent blur-3xl" />
        </div>

        <div className="relative z-10 mx-auto max-w-6xl px-6 text-center">
          {/* Badge */}
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-red-400/30 bg-red-600/10 px-4 py-1.5">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-red-500" />
            </span>
            <span className="text-xs font-semibold tracking-wide text-red-300 uppercase">AI-Powered Video Production</span>
          </div>

          <h1 className="mb-6 text-5xl font-black leading-[1.05] tracking-tight sm:text-6xl lg:text-7xl">
            Stop the Scroll.{" "}
            <span className="bg-gradient-to-r from-red-400 via-rose-400 to-red-300 bg-clip-text text-transparent">
              Start Converting.
            </span>
          </h1>

          <p className="mx-auto mb-10 max-w-2xl text-lg leading-relaxed text-gray-400 sm:text-xl">
            We produce AI-generated video content that stops thumbs mid-scroll, builds brand authority, and drives real business results — on every platform your customers live on.
          </p>

          <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <Link
              href="/#contact"
              className="group inline-flex items-center gap-2 rounded-full bg-red-600 px-8 py-4 text-sm font-semibold text-white transition-all hover:bg-red-500 hover:shadow-xl hover:shadow-red-600/25"
            >
              Get Your AI Videos
              <svg className="h-4 w-4 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
              </svg>
            </Link>
            <a
              href="#showcase"
              className="inline-flex items-center gap-2 rounded-full border border-white/20 px-8 py-4 text-sm font-semibold text-white transition-all hover:border-white/40 hover:bg-white/5"
            >
              Watch Examples
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
              </svg>
            </a>
          </div>

          {/* Stats row */}
          <div className="mt-16 grid grid-cols-2 gap-6 sm:grid-cols-4">
            {[
              { value: "3×", label: "Higher Engagement" },
              { value: "10×", label: "Faster Than Traditional" },
              { value: "6+", label: "Platform Formats" },
              { value: "48h", label: "Revision Turnaround" },
            ].map((stat) => (
              <div key={stat.label} className="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-sm">
                <p className="text-3xl font-black text-white">{stat.value}</p>
                <p className="mt-1 text-xs text-gray-400">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── VIDEO SHOWCASE ───────────────────────────────────────────────────── */}
      <section id="showcase" className="py-20 lg:py-28">
        <div className="mx-auto max-w-6xl px-6">
          <div className="mb-12 text-center">
            <h2 className="text-3xl font-black sm:text-4xl">
              Real AI Videos.{" "}
              <span className="bg-gradient-to-r from-red-400 to-rose-400 bg-clip-text text-transparent">
                Real Results.
              </span>
            </h2>
            <p className="mt-3 text-gray-400">Hover to preview · Click to watch full screen</p>
          </div>

          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 lg:gap-6">
            {VIDEOS.map((video) => (
              <VideoCard
                key={video.id}
                video={video}
                onClick={() => setActiveVideo(video)}
              />
            ))}
          </div>
        </div>
      </section>

      {/* ── PLATFORMS ───────────────────────────────────────────────────────── */}
      <section className="py-16 border-y border-white/5">
        <div className="mx-auto max-w-6xl px-6">
          <p className="mb-8 text-center text-xs font-semibold uppercase tracking-widest text-gray-500">
            Optimized for every major platform
          </p>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
            {PLATFORMS.map((p) => (
              <div key={p.name} className="flex flex-col items-center rounded-xl border border-white/10 bg-white/5 px-4 py-5 text-center">
                <span className="text-2xl">{p.icon}</span>
                <p className="mt-2 text-sm font-semibold text-white">{p.name}</p>
                <p className="mt-0.5 text-[10px] text-gray-500">{p.formats}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── BENEFITS ────────────────────────────────────────────────────────── */}
      <section className="py-20 lg:py-28">
        <div className="mx-auto max-w-6xl px-6">
          <div className="mb-14 text-center">
            <h2 className="text-3xl font-black sm:text-4xl">
              Why AI Video Is{" "}
              <span className="bg-gradient-to-r from-red-400 to-rose-400 bg-clip-text text-transparent">
                a No-Brainer
              </span>
            </h2>
            <p className="mt-3 max-w-xl mx-auto text-gray-400">
              The businesses winning on social media in 2025 aren't posting more — they're posting smarter. AI video is how you get there.
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {BENEFITS.map((b) => (
              <div
                key={b.title}
                className="group rounded-2xl border border-white/10 bg-white/5 p-6 transition-all hover:border-red-500/30 hover:bg-red-500/5"
              >
                <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-red-600/20 text-red-400 transition-colors group-hover:bg-red-600/30">
                  {b.icon}
                </div>
                <h3 className="mb-2 text-base font-bold text-white">{b.title}</h3>
                <p className="text-sm leading-relaxed text-gray-400">{b.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PROCESS ─────────────────────────────────────────────────────────── */}
      <section className="py-20 border-t border-white/5">
        <div className="mx-auto max-w-4xl px-6">
          <div className="mb-14 text-center">
            <h2 className="text-3xl font-black sm:text-4xl">How It Works</h2>
            <p className="mt-3 text-gray-400">From brief to published in days, not months.</p>
          </div>

          <div className="space-y-6">
            {[
              { step: "01", title: "Strategy Call", body: "We learn your brand, your audience, and what you want people to do after watching. 30 minutes — that's all we need." },
              { step: "02", title: "Script & Storyboard", body: "Our team writes a punchy, platform-native script and storyboards every scene. You approve before a single frame is rendered." },
              { step: "03", title: "AI Production", body: "We run your project through our AI production pipeline — visuals, voiceover, music, captions, and cuts all dialed in for maximum retention." },
              { step: "04", title: "Review & Deliver", body: "You get every format you need: 9:16, 1:1, 16:9. Revise anything. We deliver production-ready files and post-ready captions." },
            ].map((s, i) => (
              <div key={s.step} className="flex gap-6 items-start">
                <div className="flex-shrink-0 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-red-700 to-red-900 text-sm font-black text-white">
                  {s.step}
                </div>
                <div className="flex-1 pb-6 border-b border-white/5 last:border-0">
                  <h3 className="text-base font-bold text-white">{s.title}</h3>
                  <p className="mt-1 text-sm leading-relaxed text-gray-400">{s.body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ─────────────────────────────────────────────────────────────── */}
      <section className="py-20 lg:py-28">
        <div className="mx-auto max-w-4xl px-6">
          <div className="relative overflow-hidden rounded-3xl border border-red-500/20 bg-gradient-to-br from-red-950/60 to-gray-900 p-10 text-center lg:p-16">
            <div className="absolute -top-20 -right-20 h-64 w-64 rounded-full bg-red-600/20 blur-3xl" />
            <div className="absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-rose-600/10 blur-3xl" />

            <div className="relative z-10">
              <h2 className="text-3xl font-black sm:text-4xl lg:text-5xl">
                Ready to Stop Being{" "}
                <span className="bg-gradient-to-r from-red-400 to-rose-300 bg-clip-text text-transparent">
                  Invisible Online?
                </span>
              </h2>
              <p className="mx-auto mt-4 max-w-xl text-gray-400">
                Your competitors are already posting video. The question is whether they'll keep outranking you — or whether you'll leapfrog them with AI-powered content that actually converts.
              </p>
              <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
                <Link
                  href="/#contact"
                  className="group inline-flex items-center gap-2 rounded-full bg-red-600 px-8 py-4 text-sm font-semibold text-white transition-all hover:bg-red-500 hover:shadow-xl hover:shadow-red-600/25"
                >
                  Start My AI Video Project
                  <svg className="h-4 w-4 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
                  </svg>
                </Link>
                <Link
                  href="/"
                  className="text-sm font-medium text-gray-400 hover:text-white transition-colors"
                >
                  ← Back to Crystal Studios
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <SiteFooter siteLogo={siteLogo} />
      <AskChrissy />

      {/* Lightbox */}
      {activeVideo && (
        <VideoLightbox video={activeVideo} onClose={() => setActiveVideo(null)} />
      )}
    </div>
  );
}
