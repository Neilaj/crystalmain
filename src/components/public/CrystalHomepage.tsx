"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import SiteFooter from "./SiteFooter";
import AskChrissy from "./AskChrissy";
import { DEFAULT_HOMEPAGE_CONTENT, type HomepageContent } from "@/types/homepage-content";

// ─── Intersection Observer Hook ─────────────────────
function useInView(threshold = 0.15) {
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          observer.unobserve(el);
        }
      },
      { threshold }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [threshold]);

  return { ref, inView };
}

// ─── Animated Counter ────────────────────────────────
function Counter({ target, suffix = "" }: { target: number; suffix?: string }) {
  const [count, setCount] = useState(0);
  const { ref, inView } = useInView();

  useEffect(() => {
    if (!inView) return;
    const duration = 2000;
    const startTime = performance.now();

    function animate(now: number) {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.round(eased * target));
      if (progress < 1) requestAnimationFrame(animate);
    }
    requestAnimationFrame(animate);
  }, [inView, target]);

  return (
    <span ref={ref}>
      {count}
      {suffix}
    </span>
  );
}

// ─── Service Card with Image ─────────────────────────
function ServiceCard({
  image,
  title,
  description,
  tag,
  delay,
  href,
}: {
  image: string;
  title: string;
  description: string;
  tag: string;
  delay: number;
  href?: string;
}) {
  const { ref, inView } = useInView(0.1);

  const inner = (
    <>
      <div className="relative h-52 overflow-hidden">
        <Image
          src={image}
          alt={title}
          fill
          className="object-cover transition-transform duration-700 group-hover:scale-105"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
        <span className="absolute top-4 left-4 rounded-full bg-white/90 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-gray-700 backdrop-blur-sm">
          {tag}
        </span>
      </div>
      <div className="p-6">
        <h3 className="mb-2 text-lg font-bold text-gray-900 flex items-center gap-2">
          {title}
          {href && (
            <svg className="h-4 w-4 text-red-500 opacity-0 group-hover:opacity-100 transition-opacity" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 0 0 3 8.25v10.5A2.25 2.25 0 0 0 5.25 21h10.5A2.25 2.25 0 0 0 18 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
            </svg>
          )}
        </h3>
        <p className="text-sm leading-relaxed text-gray-500">{description}</p>
      </div>
    </>
  );

  const cardClass = `service-card-light group overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm transition-all duration-700 hover:shadow-xl hover:-translate-y-1 ${
    inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-12"
  } ${href ? "cursor-pointer" : ""}`;

  return href ? (
    <a
      ref={ref as React.Ref<HTMLAnchorElement>}
      href={href}
      className={cardClass}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {inner}
    </a>
  ) : (
    <div
      ref={ref}
      className={cardClass}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {inner}
    </div>
  );
}

// ─── Lazy 3D Model Viewer (only loads Three.js when scrolled into view) ───
function LazyModelViewer() {
  const { ref, inView } = useInView(0.05);
  const [ModelComp, setModelComp] = useState<React.ComponentType<{
    modelUrl: string;
    className?: string;
    style?: React.CSSProperties;
  }> | null>(null);

  useEffect(() => {
    if (inView && !ModelComp) {
      import("./ModelViewer").then((mod) => setModelComp(() => mod.default));
    }
  }, [inView, ModelComp]);

  return (
    <div ref={ref} className="relative mx-auto w-full max-w-md lg:max-w-none">
      <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm">
        {ModelComp ? (
          <ModelComp
            modelUrl="https://tvcsf7shtoelkabr.public.blob.vercel-storage.com/models/Lac-Blk-Trainers.glb"
            className="h-[350px] w-full sm:h-[400px] lg:h-[450px]"
          />
        ) : (
          <div className="flex h-[350px] w-full items-center justify-center sm:h-[400px] lg:h-[450px]">
            <div className="text-center text-gray-500">
              {inView ? (
                <>
                  <svg className="mx-auto h-10 w-10 animate-spin" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="m21 7.5-9-5.25L3 7.5m18 0-9 5.25m9-5.25v9l-9 5.25M3 7.5l9 5.25M3 7.5v9l9 5.25m0-9v9" />
                  </svg>
                  <p className="mt-2 text-sm">Loading 3D viewer...</p>
                </>
              ) : (
                <>
                  <svg className="mx-auto h-10 w-10" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="m21 7.5-9-5.25L3 7.5m18 0-9 5.25m9-5.25v9l-9 5.25M3 7.5l9 5.25M3 7.5v9l9 5.25m0-9v9" />
                  </svg>
                  <p className="mt-2 text-sm">3D Viewer</p>
                </>
              )}
            </div>
          </div>
        )}
      </div>
      <div className="mt-4 flex items-center justify-center gap-4 sm:gap-6 text-xs sm:text-sm text-gray-400">
        <span className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-red-500" />
          Web 3D Viewer
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-rose-500" />
          iOS AR Ready
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-red-400" />
          Real-time Rendering
        </span>
      </div>
    </div>
  );
}

// ─── Main Homepage ───────────────────────────────────
interface NavItem {
  id: string;
  label: string;
  url: string;
  openNew: boolean;
}

interface CrystalHomepageProps {
  headerNav?: NavItem[];
  footerNav?: NavItem[];
  homepageContent?: HomepageContent;
  siteLogo?: string;
}

export default function CrystalHomepage({ headerNav = [], footerNav = [], homepageContent, siteLogo }: CrystalHomepageProps) {
  const c = homepageContent ?? DEFAULT_HOMEPAGE_CONTENT;
  // Hero entrance animations are CSS-only (no JS state needed) → better LCP

  const statsSection = useInView(0.2);
  const processSection = useInView(0.15);
  const showcaseSection = useInView(0.1);
  const ctaSection = useInView(0.2);

  return (
    <div className="crystal-homepage bg-white text-gray-900">
      {/* ═══ NAVIGATION ═══ */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-red-900/20 bg-[#1a0a0a]/95 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <a href="/" className="flex items-center gap-2">
            {siteLogo ? (
              <img src={siteLogo} alt="Crystal Studios" className="h-10 w-auto object-contain" />
            ) : (
              <>
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-red-700 to-red-900">
                  <svg className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09Z" />
                  </svg>
                </div>
                <span className="text-lg font-bold text-white">Crystal Studios</span>
              </>
            )}
          </a>
          <div className="hidden items-center gap-8 sm:flex">
            {headerNav.map((item) => {
              // Make the last item (or "Contact"/"Get in touch") a CTA button
              const isCta = item.label.toLowerCase().includes("contact") || item.url === "#contact";
              return isCta ? (
                <a
                  key={item.id}
                  href={item.url}
                  target={item.openNew ? "_blank" : undefined}
                  className="rounded-full bg-red-700 px-5 py-2 text-sm font-semibold text-white transition-all hover:bg-red-600 hover:shadow-lg hover:shadow-red-900/20"
                >
                  Get in touch
                </a>
              ) : (
                <a
                  key={item.id}
                  href={item.url}
                  target={item.openNew ? "_blank" : undefined}
                  className="text-sm font-medium text-gray-400 hover:text-white transition-colors"
                >
                  {item.label}
                </a>
              );
            })}
            {headerNav.length === 0 && (
              <a href="#contact" className="rounded-full bg-red-700 px-5 py-2 text-sm font-semibold text-white transition-all hover:bg-red-600">
                Get in touch
              </a>
            )}
          </div>
          {/* Mobile hamburger */}
          <button
            className="sm:hidden flex items-center justify-center h-10 w-10 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
            onClick={() => {
              const menu = document.getElementById("mobile-menu");
              if (menu) menu.classList.toggle("hidden");
            }}
            aria-label="Toggle menu"
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
            </svg>
          </button>
        </div>
        {/* Mobile menu dropdown */}
        <div id="mobile-menu" className="hidden sm:hidden border-t border-red-900/20 bg-[#1a0a0a]/98 px-6 pb-6 pt-4 space-y-3">
          {headerNav.map((item) => {
            const isCta = item.label.toLowerCase().includes("contact") || item.url === "#contact";
            return isCta ? (
              <a
                key={item.id}
                href={item.url}
                className="block w-full text-center rounded-full bg-red-700 px-5 py-3 text-sm font-semibold text-white transition-all hover:bg-red-600 mt-2"
              >
                Get in touch
              </a>
            ) : (
              <a
                key={item.id}
                href={item.url}
                target={item.openNew ? "_blank" : undefined}
                className="block text-base font-medium text-gray-300 hover:text-white transition-colors py-2"
              >
                {item.label}
              </a>
            );
          })}
        </div>
      </nav>

      {/* ═══ HERO SECTION ═══ */}
      <section className="relative min-h-screen overflow-hidden bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 pt-20">
        {/* Grid pattern overlay */}
        <div className="absolute inset-0 opacity-10">
          <svg width="100%" height="100%">
            <defs>
              <pattern id="hero-grid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="white" strokeWidth="0.3" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#hero-grid)" />
          </svg>
        </div>
        <div className="absolute top-20 right-0 h-[600px] w-[600px] rounded-full bg-gradient-to-br from-red-900/30 to-transparent opacity-60 blur-3xl" />
        <div className="absolute bottom-0 left-0 h-[400px] w-[400px] rounded-full bg-gradient-to-tr from-red-800/20 to-transparent opacity-40 blur-3xl" />

        <div className="relative z-10 mx-auto flex max-w-6xl flex-col-reverse items-center px-6 pt-8 lg:flex-row lg:items-center lg:gap-16 lg:pt-16">
          {/* Left — Hero Person Image */}
          <div className="mt-12 flex-1 lg:mt-0 hero-slide-in hero-delay-2">
            <div className="relative mx-auto max-w-md">
              <div className="relative overflow-hidden rounded-3xl">
                <Image
                  src={c.hero.heroImageUrl || "/images/hero-person.webp"}
                  alt="Crystal Studios — We build digital experiences"
                  width={500}
                  height={650}
                  className="object-cover"
                  priority
                  fetchPriority="high"
                  sizes="(max-width: 768px) 90vw, 500px"
                />
              </div>
              {/* Background decorative blobs */}
              <div className="absolute -top-10 -right-10 h-40 w-40 rounded-full bg-red-600/20 opacity-60 blur-2xl" />
              <div className="absolute -bottom-10 -left-10 h-32 w-32 rounded-full bg-red-500/20 opacity-60 blur-2xl" />
            </div>
          </div>

          {/* Right — Text */}
          <div className="flex-1 text-center lg:text-left">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-red-400/30 bg-red-600/10 px-4 py-1.5 hero-fade-up hero-delay-0">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-red-500" />
              </span>
              <span className="text-xs font-semibold tracking-wide text-red-300">
                {c.hero.badge}
              </span>
            </div>

            <h1 className="mb-6 text-4xl font-extrabold leading-[1.1] tracking-tight text-white sm:text-5xl lg:text-6xl hero-fade-up hero-delay-1">
              {c.hero.headline}{" "}
              <span className="bg-gradient-to-r from-red-400 via-rose-400 to-red-300 bg-clip-text text-transparent">
                {c.hero.highlight}
              </span>{" "}
              that move people.
            </h1>

            <p className="mb-8 max-w-lg text-lg leading-relaxed text-gray-400 sm:text-xl lg:mx-0 mx-auto hero-fade-up hero-delay-2">
              {c.hero.subtext}
            </p>

            <div className="flex flex-col items-center gap-3 sm:flex-row lg:justify-start justify-center hero-fade-up hero-delay-3">
              <a
                href="#contact"
                className="group inline-flex items-center gap-2 rounded-full bg-red-600 px-7 py-3.5 text-sm font-semibold text-white transition-all hover:bg-red-500 hover:shadow-xl hover:shadow-red-600/20"
              >
                {c.hero.cta1Text}
                <svg className="h-4 w-4 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
                </svg>
              </a>
              <a
                href="#work"
                className="inline-flex items-center gap-2 rounded-full border border-white/20 px-7 py-3.5 text-sm font-semibold text-white transition-all hover:border-white/40 hover:bg-white/5"
              >
                {c.hero.cta2Text}
              </a>
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 hero-fade-in hero-delay-6">
          <div className="flex flex-col items-center gap-2">
            <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-gray-500">Scroll</span>
            <div className="h-10 w-[1px] bg-gradient-to-b from-gray-500 to-transparent scroll-line" />
          </div>
        </div>
      </section>

      {/* ═══ SERVICES SECTION ═══ */}
      <section id="services" className="py-24 lg:py-32">
        <div className="mx-auto max-w-6xl px-6">
          <div className="mb-16 text-center">
            <p className="mb-3 text-sm font-semibold uppercase tracking-[0.15em] text-red-700">
              {c.services.eyebrow}
            </p>
            <h2 className="mx-auto max-w-2xl text-3xl font-extrabold leading-tight text-gray-900 sm:text-4xl lg:text-5xl">
              {c.services.headline}{" "}
              <span className="bg-gradient-to-r from-red-700 to-red-500 bg-clip-text text-transparent">
                {c.services.highlight}
              </span>
            </h2>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {c.services.items.map((svc, i) => (
              <ServiceCard
                key={i}
                delay={i * 100}
                tag={svc.tag}
                image={svc.imageUrl}
                title={svc.title}
                description={svc.description}
                href={svc.href ? (svc.href.startsWith("http") || svc.href.startsWith("/") ? svc.href : `/${svc.href}`) : undefined}
              />
            ))}
          </div>
        </div>
      </section>

      {/* ═══ PARSLEY PLATFORM SECTION ═══ */}
      <section className="border-y border-gray-100 bg-gradient-to-b from-white to-gray-50 py-14 lg:py-20">
        <div className="mx-auto max-w-6xl px-6">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            <div>
              <span className="mb-4 inline-flex items-center gap-2 rounded-full border border-red-200 bg-red-50 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-red-700">
                <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09Z" />
                </svg>
                {c.parsley.eyebrow}
              </span>
              <h2 className="mb-6 text-3xl font-extrabold leading-snug text-gray-900 sm:text-4xl lg:text-5xl">
                {c.parsley.headline}{" "}
                <span className="bg-gradient-to-r from-red-700 to-red-500 bg-clip-text text-transparent pb-1 inline-block">
                  {c.parsley.highlight}
                </span>
                , our proprietary AI-first platform
              </h2>
              <p className="mb-6 text-lg leading-relaxed text-gray-500">
                {c.parsley.para1}
              </p>
              <p className="mb-8 text-lg leading-relaxed text-gray-500">
                {c.parsley.para2}
              </p>
              <div className="space-y-4">
                {c.parsley.features.map((item) => (
                  <div key={item.title} className="flex gap-3">
                    <div className="mt-1 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-red-100">
                      <svg className="h-3 w-3 text-red-600" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                      </svg>
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">{item.title}</p>
                      <p className="text-sm text-gray-500">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="relative">
              <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-xl">
                <div className="mb-6 flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-100">
                    <span className="text-lg">🌿</span>
                  </div>
                  <div>
                    <p className="font-bold text-gray-900">Parsley CMS</p>
                    <p className="text-xs text-gray-400">AI-First Content Platform</p>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center justify-between rounded-lg bg-green-50 px-4 py-3">
                    <span className="text-sm font-medium text-gray-700">llms.txt</span>
                    <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-semibold text-green-700">Auto-generated</span>
                  </div>
                  <div className="flex items-center justify-between rounded-lg bg-green-50 px-4 py-3">
                    <span className="text-sm font-medium text-gray-700">Schema.org JSON-LD</span>
                    <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-semibold text-green-700">Per page</span>
                  </div>
                  <div className="flex items-center justify-between rounded-lg bg-green-50 px-4 py-3">
                    <span className="text-sm font-medium text-gray-700">Sitemap + RSS</span>
                    <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-semibold text-green-700">Auto-generated</span>
                  </div>
                  <div className="flex items-center justify-between rounded-lg bg-green-50 px-4 py-3">
                    <span className="text-sm font-medium text-gray-700">Content Hubs</span>
                    <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-semibold text-green-700">Topic clusters</span>
                  </div>
                  <div className="flex items-center justify-between rounded-lg bg-blue-50 px-4 py-3">
                    <span className="text-sm font-medium text-gray-700">AI Crawlers Allowed</span>
                    <span className="text-xs text-blue-600">GPTBot, ClaudeBot, PerplexityBot</span>
                  </div>
                </div>
                <div className="mt-6 rounded-lg bg-gray-50 p-4">
                  <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-2">Performance</p>
                  <div className="grid grid-cols-3 gap-3 text-center">
                    <div>
                      <p className="text-2xl font-bold text-green-600">100</p>
                      <p className="text-[10px] text-gray-400">PageSpeed</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-green-600">&lt;1s</p>
                      <p className="text-[10px] text-gray-400">Load Time</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-green-600">A+</p>
                      <p className="text-[10px] text-gray-400">Security</p>
                    </div>
                  </div>
                </div>
              </div>
              {/* Decorative blobs */}
              <div className="absolute -top-6 -right-6 h-32 w-32 rounded-full bg-red-100 opacity-50 blur-2xl" />
              <div className="absolute -bottom-6 -left-6 h-24 w-24 rounded-full bg-green-100 opacity-50 blur-2xl" />
            </div>
          </div>
        </div>
      </section>

      {/* ═══ 3D & AR HIGHLIGHT SECTION ═══ */}
      <section className="relative overflow-hidden bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 py-24 lg:py-32 text-white">
        <div className="absolute inset-0 opacity-10">
          <svg width="100%" height="100%">
            <defs>
              <pattern id="ar-grid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="white" strokeWidth="0.3" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#ar-grid)" />
          </svg>
        </div>
        <div className="relative z-10 mx-auto max-w-6xl px-6">
          <div className="grid items-center gap-8 sm:gap-12 lg:grid-cols-2">
            <div className="min-w-0">
              <span className="mb-4 inline-flex items-center gap-2 rounded-full border border-red-400/30 bg-red-600/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-red-300">
                <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 7.5l-2.25-1.313M21 7.5v2.25m0-2.25l-2.25 1.313M3 7.5l2.25-1.313M3 7.5l2.25 1.313M3 7.5v2.25m9 3l2.25-1.313M12 12.75l-2.25-1.313M12 12.75V15m0 6.75l2.25-1.313M12 21.75V19.5m0 2.25l-2.25-1.313m0-16.875L12 2.25l2.25 1.313M21 14.25v2.25l-2.25 1.313m-13.5 0L3 16.5v-2.25" />
                </svg>
                {c.ar.badge}
              </span>
              <h2 className="mb-6 text-2xl font-extrabold leading-tight sm:text-3xl lg:text-5xl">
                {c.ar.headline}{" "}
                <span className="bg-gradient-to-r from-red-400 to-rose-400 bg-clip-text text-transparent">
                  {c.ar.highlight1}
                </span>{" "}
                and{" "}
                <span className="bg-gradient-to-r from-rose-400 to-red-500 bg-clip-text text-transparent">
                  {c.ar.highlight2}
                </span>
              </h2>
              <p className="mb-6 text-base leading-relaxed text-gray-300 sm:text-lg">
                {c.ar.para1}
              </p>
              <p className="mb-8 text-base leading-relaxed text-gray-300 sm:text-lg">
                {c.ar.para2}
              </p>
              <div className="flex flex-wrap gap-3">
                {c.ar.tags.map((tag) => (
                  <span key={tag} className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-medium text-gray-300">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
            <LazyModelViewer />
          </div>
        </div>
      </section>

      {/* ═══ SHOWCASE / WORK SECTION ═══ */}
      <section id="work" className="bg-gray-50 py-24 lg:py-32">
        <div className="mx-auto max-w-6xl px-6">
          <div
            ref={showcaseSection.ref}
            className={`mb-16 text-center transition-all duration-1000 ${
              showcaseSection.inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
            }`}
          >
            <p className="mb-3 text-sm font-semibold uppercase tracking-[0.15em] text-red-600">
              {c.showcase.eyebrow}
            </p>
            <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl lg:text-5xl">
              {c.showcase.headline}
            </h2>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {c.showcase.items.map((item, i) => {
              // Strip any accidental localhost prefix from image URLs
              const cleanImageUrl = item.imageUrl
                ? item.imageUrl.replace(/^https?:\/\/localhost:\d+/, "")
                : "";
              const isExternal = cleanImageUrl.startsWith("http://") || cleanImageUrl.startsWith("https://");

              return (
              <a
                key={i}
                href={item.href}
                target="_blank"
                rel="noopener noreferrer"
                className="group block"
                style={{ animationDelay: `${i * 100}ms` }}
              >
                <div className="relative overflow-hidden rounded-2xl shadow-lg shadow-gray-200/80 transition-all duration-300 group-hover:shadow-xl group-hover:shadow-gray-300/60 group-hover:-translate-y-1.5">
                  <div className="relative aspect-[4/3] w-full bg-gray-100">
                    {cleanImageUrl ? (
                      isExternal ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={cleanImageUrl}
                          alt={item.title}
                          className="absolute inset-0 h-full w-full object-cover object-top transition-transform duration-500 group-hover:scale-[1.04]"
                          loading="lazy"
                        />
                      ) : (
                        <Image
                          src={cleanImageUrl}
                          alt={item.title}
                          fill
                          className="object-cover object-top transition-transform duration-500 group-hover:scale-[1.04]"
                          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                          loading="lazy"
                        />
                      )
                    ) : (
                      <div className="absolute inset-0 bg-gradient-to-br from-gray-800 to-gray-900" />
                    )}
                  </div>
                  <div className="absolute inset-0 rounded-2xl ring-1 ring-inset ring-black/5" />
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-5">
                    <span className="mb-2 inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-white backdrop-blur-md">
                      <span className="h-1.5 w-1.5 rounded-full bg-green-400" />
                      {item.tag}
                    </span>
                    <h3 className="text-lg font-bold text-white">{item.title}</h3>
                    <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-white/70">
                      {item.description}
                    </p>
                    <span className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-white/80 transition-colors group-hover:text-white">
                      {item.href.replace("https://", "").replace("http://", "")}
                      <svg className="h-3 w-3 transition-transform group-hover:translate-x-0.5" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
                      </svg>
                    </span>
                  </div>
                </div>
              </a>
              );
            })}
          </div>
        </div>
      </section>

      {/* ═══ PROCESS SECTION ═══ */}

      <section id="process" className="py-24 lg:py-32">
        <div className="mx-auto max-w-6xl px-6">
          <div
            ref={processSection.ref}
            className={`mb-16 text-center transition-all duration-1000 ${
              processSection.inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
            }`}
          >
            <p className="mb-3 text-sm font-semibold uppercase tracking-[0.15em] text-red-700">
              {c.process.eyebrow}
            </p>
            <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl lg:text-5xl">
              {c.process.headline}{" "}
              <span className="bg-gradient-to-r from-red-600 to-rose-500 bg-clip-text text-transparent">
                {c.process.highlight}
              </span>
            </h2>
          </div>

          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {c.process.steps.map((item, i) => {
              const colors = [
                { color: "bg-red-100 text-red-700", border: "border-red-200" },
                { color: "bg-rose-100 text-rose-700", border: "border-rose-200" },
                { color: "bg-rose-100 text-rose-700", border: "border-rose-200" },
                { color: "bg-amber-100 text-amber-600", border: "border-amber-200" },
              ];
              const { color, border } = colors[i % colors.length];
              // eslint-disable-next-line react-hooks/rules-of-hooks
              const { ref, inView } = useInView(0.2);
              return (
                <div
                  key={item.step}
                  ref={ref}
                  className={`rounded-2xl border ${border} bg-white p-6 transition-all duration-700 hover:shadow-lg ${
                    inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
                  }`}
                  style={{ transitionDelay: `${i * 100}ms` }}
                >
                  <div className={`mb-4 inline-flex rounded-xl ${color} px-3 py-1.5`}>
                    <span className="text-sm font-bold">{item.step}</span>
                  </div>
                  <h3 className="mb-2 text-xl font-bold text-gray-900">{item.title}</h3>
                  <p className="text-sm leading-relaxed text-gray-500">{item.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ═══ CTA SECTION ═══ */}
      <section id="contact" className="py-24 lg:py-32">
        <div
          ref={ctaSection.ref}
          className={`mx-auto max-w-4xl px-6 text-center transition-all duration-1000 ${
            ctaSection.inView ? "opacity-100 translate-y-0 scale-100" : "opacity-0 translate-y-10 scale-95"
          }`}
        >
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-12 sm:p-16">
            {/* Decorative elements */}
            <div className="absolute -top-32 -right-32 h-64 w-64 rounded-full bg-red-600/10 blur-3xl" />
            <div className="absolute -bottom-32 -left-32 h-64 w-64 rounded-full bg-red-500/10 blur-3xl" />

            <div className="relative z-10">
              <h2 className="text-3xl font-extrabold leading-tight text-white sm:text-4xl lg:text-5xl">
                {c.cta.headline}{" "}
                <span className="bg-gradient-to-r from-red-400 via-rose-400 to-red-300 bg-clip-text text-transparent">
                  {c.cta.highlight}
                </span>
              </h2>
              <p className="mx-auto mt-5 max-w-xl text-lg text-gray-400">
                {c.cta.subtext}
              </p>
              <div className="mt-10 mx-auto max-w-lg">
                <HomepageContactForm />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ FOOTER ═══ */}
      <SiteFooter siteLogo={siteLogo} />

      {/* ═══ ASK CHRISSY ═══ */}
      <AskChrissy />
    </div>
  );
}

// ─── Inline contact form for homepage CTA ─────────────
function HomepageContactForm() {
  const [data, setData] = useState({ name: "", email: "", message: "" });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    try {
      const res = await fetch("/api/forms/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ formSlug: "contact", data }),
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
      <div className="rounded-2xl border border-green-500/30 bg-green-500/10 p-8 text-center">
        <svg className="mx-auto h-10 w-10 text-green-400" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
        </svg>
        <p className="mt-3 text-lg font-semibold text-white">Message sent!</p>
        <p className="mt-1 text-sm text-gray-400">We&apos;ll get back to you within 24 hours.</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 text-left">
      {error && (
        <div className="rounded-lg bg-red-500/20 border border-red-500/30 p-3 text-sm text-red-300">
          {error}
        </div>
      )}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <input
            type="text"
            placeholder="Your name"
            value={data.name}
            onChange={(e) => setData({ ...data, name: e.target.value })}
            required
            className="w-full rounded-xl border border-gray-700 bg-gray-800/50 px-4 py-3 text-sm text-white placeholder-gray-500 focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500"
          />
        </div>
        <div>
          <input
            type="email"
            placeholder="Your email"
            value={data.email}
            onChange={(e) => setData({ ...data, email: e.target.value })}
            required
            className="w-full rounded-xl border border-gray-700 bg-gray-800/50 px-4 py-3 text-sm text-white placeholder-gray-500 focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500"
          />
        </div>
      </div>
      <div>
        <textarea
          placeholder="Tell us about your project..."
          value={data.message}
          onChange={(e) => setData({ ...data, message: e.target.value })}
          required
          rows={4}
          className="w-full rounded-xl border border-gray-700 bg-gray-800/50 px-4 py-3 text-sm text-white placeholder-gray-500 focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500"
        />
      </div>
      <button
        type="submit"
        disabled={submitting}
        className="w-full rounded-xl bg-white px-6 py-3 text-sm font-bold text-gray-900 transition-all hover:scale-[1.02] hover:shadow-xl disabled:opacity-50"
      >
        {submitting ? "Sending..." : "Send Message →"}
      </button>
    </form>
  );
}
