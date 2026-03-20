"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import dynamic from "next/dynamic";
import SiteFooter from "./SiteFooter";

const ModelViewer = dynamic(() => import("./ModelViewer"), { ssr: false });

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
}: {
  image: string;
  title: string;
  description: string;
  tag: string;
  delay: number;
}) {
  const { ref, inView } = useInView(0.1);

  return (
    <div
      ref={ref}
      className={`service-card-light group overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm transition-all duration-700 hover:shadow-xl hover:-translate-y-1 ${
        inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-12"
      }`}
      style={{ transitionDelay: `${delay}ms` }}
    >
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
        <h3 className="mb-2 text-lg font-bold text-gray-900">{title}</h3>
        <p className="text-sm leading-relaxed text-gray-500">{description}</p>
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
}

export default function CrystalHomepage({ headerNav = [], footerNav = [] }: CrystalHomepageProps) {
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setLoaded(true);
  }, []);

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
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-red-700 to-red-900">
              <svg className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09Z" />
              </svg>
            </div>
            <span className="text-lg font-bold text-white">Crystal Studios</span>
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
          <div
            className={`mt-12 flex-1 lg:mt-0 transition-all duration-1000 delay-300 ${
              loaded ? "opacity-100 translate-x-0 scale-100" : "opacity-0 -translate-x-12 scale-95"
            }`}
          >
            <div className="relative mx-auto max-w-md">
              <div className="relative overflow-hidden rounded-3xl">
                <Image
                  src="/images/hero-person.png"
                  alt="Crystal Studios — We build digital experiences"
                  width={500}
                  height={650}
                  className="object-cover"
                  priority
                />
              </div>
              {/* Background decorative blobs */}
              <div className="absolute -top-10 -right-10 h-40 w-40 rounded-full bg-red-600/20 opacity-60 blur-2xl" />
              <div className="absolute -bottom-10 -left-10 h-32 w-32 rounded-full bg-red-500/20 opacity-60 blur-2xl" />
            </div>
          </div>

          {/* Right — Text */}
          <div className="flex-1 text-center lg:text-left">
            <div
              className={`mb-6 inline-flex items-center gap-2 rounded-full border border-red-400/30 bg-red-600/10 px-4 py-1.5 transition-all duration-1000 ${
                loaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
              }`}
            >
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-red-500" />
              </span>
              <span className="text-xs font-semibold tracking-wide text-red-300">
                Now accepting projects for 2026
              </span>
            </div>

            <h1
              className={`mb-6 text-4xl font-extrabold leading-[1.1] tracking-tight text-white sm:text-5xl lg:text-6xl transition-all duration-1000 delay-200 ${
                loaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
              }`}
            >
              We build{" "}
              <span className="bg-gradient-to-r from-red-400 via-rose-400 to-red-300 bg-clip-text text-transparent">
                digital experiences
              </span>{" "}
              that move people.
            </h1>

            <p
              className={`mb-8 max-w-lg text-lg leading-relaxed text-gray-400 sm:text-xl lg:mx-0 mx-auto transition-all duration-1000 delay-400 ${
                loaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
              }`}
            >
              Web design, custom software, mobile apps, interactive 3D product experiences, AR on iOS, AI-powered video — everything your business needs to dominate online.
            </p>

            <div
              className={`flex flex-col items-center gap-3 sm:flex-row lg:justify-start justify-center transition-all duration-1000 delay-500 ${
                loaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
              }`}
            >
              <a
                href="#contact"
                className="group inline-flex items-center gap-2 rounded-full bg-red-600 px-7 py-3.5 text-sm font-semibold text-white transition-all hover:bg-red-500 hover:shadow-xl hover:shadow-red-600/20"
              >
                Start a project
                <svg className="h-4 w-4 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
                </svg>
              </a>
              <a
                href="#work"
                className="inline-flex items-center gap-2 rounded-full border border-white/20 px-7 py-3.5 text-sm font-semibold text-white transition-all hover:border-white/40 hover:bg-white/5"
              >
                View our work
              </a>
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div
          className={`absolute bottom-8 left-1/2 -translate-x-1/2 transition-all duration-1000 delay-700 ${
            loaded ? "opacity-100" : "opacity-0"
          }`}
        >
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
              What we do
            </p>
            <h2 className="mx-auto max-w-2xl text-3xl font-extrabold leading-tight text-gray-900 sm:text-4xl lg:text-5xl">
              Everything your brand needs to{" "}
              <span className="bg-gradient-to-r from-red-700 to-red-500 bg-clip-text text-transparent">
                dominate online
              </span>
            </h2>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            <ServiceCard
              delay={0}
              tag="Web"
              image="https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=600&h=400&fit=crop"
              title="Web Design & Development"
              description="Pixel-perfect, blazing-fast websites built with modern frameworks. Optimized for AI search engines so your content gets cited, not buried."
            />
            <ServiceCard
              delay={100}
              tag="Mobile"
              image="https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=600&h=400&fit=crop"
              title="App Development"
              description="Native and cross-platform mobile apps that users love. From concept to App Store, experiences that feel intuitive and perform flawlessly."
            />
            <ServiceCard
              delay={200}
              tag="AR / 3D"
              image="https://images.unsplash.com/photo-1617802690992-15d93263d3a9?w=600&h=400&fit=crop"
              title="3D for Web & AR on iOS"
              description="We build interactive 3D product viewers for the web and native AR experiences on iOS using ARKit and USDZ. Customers can place your products in their real space before buying."
            />
            <ServiceCard
              delay={300}
              tag="AI Video"
              image="https://images.unsplash.com/photo-1626379953822-baec19c3accd?w=600&h=400&fit=crop"
              title="AI Video Production"
              description="AI-generated social media videos that stop the scroll. Thumb-stopping content at scale — reels, shorts, and stories that convert."
            />
            <ServiceCard
              delay={400}
              tag="Strategy"
              image="https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=600&h=400&fit=crop"
              title="Digital Strategy"
              description="SEO, analytics, conversion optimization, and growth planning. We don't just build — we help you win with data-driven strategy."
            />
            <ServiceCard
              delay={500}
              tag="Software"
              image="/images/custom-software-box.png"
              title="Custom Software Development"
              description="We build complete SaaS platforms and business management tools from the ground up. Invoicing, CRM, scheduling, crew management — whatever your business needs to run smarter."
            />
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
                Our Advantage
              </span>
              <h2 className="mb-6 text-3xl font-extrabold leading-snug text-gray-900 sm:text-4xl lg:text-5xl">
                Built on{" "}
                <span className="bg-gradient-to-r from-red-700 to-red-500 bg-clip-text text-transparent pb-1 inline-block">
                  Parsley
                </span>
                , our proprietary AI-first platform
              </h2>
              <p className="mb-6 text-lg leading-relaxed text-gray-500">
                Every website we build runs on Parsley — our proprietary CMS platform engineered from the ground up to be visible to AI search engines like ChatGPT, Perplexity, and Google AI Overviews.
              </p>
              <p className="mb-8 text-lg leading-relaxed text-gray-500">
                While other agencies build on WordPress and hope for the best, we give your business a structural advantage. Your site automatically generates the structured data, content hubs, and semantic markup that AI engines need to find, understand, and cite your content.
              </p>
              <div className="space-y-4">
                {[
                  { title: "AI Search Optimized", desc: "Auto-generated llms.txt, Schema.org JSON-LD, and semantic HTML — your content gets cited, not buried" },
                  { title: "Blazing Fast", desc: "Server-side rendered with Next.js and edge caching. Sub-second load times, every page" },
                  { title: "Unhackable by Design", desc: "No PHP, no plugin vulnerabilities, no security patches. Modern TypeScript stack that stays secure" },
                  { title: "Content Hub Architecture", desc: "Built-in topic clustering that signals topical authority to both Google and AI search engines" },
                  { title: "Mobile-First by Design", desc: "Every site is responsive from day one. Google uses mobile-first indexing — our sites are built for it, not retrofitted" },
                ].map((item) => (
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
        <div className="relative z-10 mx-auto max-w-6xl px-6 overflow-hidden">
          <div className="grid items-center gap-8 sm:gap-12 lg:grid-cols-2">
            <div className="min-w-0">
              <span className="mb-4 inline-flex items-center gap-2 rounded-full border border-red-400/30 bg-red-600/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-red-300">
                <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 7.5l-2.25-1.313M21 7.5v2.25m0-2.25l-2.25 1.313M3 7.5l2.25-1.313M3 7.5l2.25 1.313M3 7.5v2.25m9 3l2.25-1.313M12 12.75l-2.25-1.313M12 12.75V15m0 6.75l2.25-1.313M12 21.75V19.5m0 2.25l-2.25-1.313m0-16.875L12 2.25l2.25 1.313M21 14.25v2.25l-2.25 1.313m-13.5 0L3 16.5v-2.25" />
                </svg>
                3D & Augmented Reality
              </span>
              <h2 className="mb-6 text-2xl font-extrabold leading-tight sm:text-3xl lg:text-5xl">
                Your products in{" "}
                <span className="bg-gradient-to-r from-red-400 to-rose-400 bg-clip-text text-transparent">
                  3D on the web
                </span>{" "}
                and{" "}
                <span className="bg-gradient-to-r from-rose-400 to-red-500 bg-clip-text text-transparent">
                  AR on iOS
                </span>
              </h2>
              <p className="mb-6 text-base leading-relaxed text-gray-300 sm:text-lg">
                We create photorealistic 3D models of your physical products and deploy them as interactive viewers on your website — customers can rotate, zoom, and inspect every detail.
              </p>
              <p className="mb-8 text-base leading-relaxed text-gray-300 sm:text-lg">
                For iOS, we build native AR experiences using ARKit and USDZ. Your customers tap a button and see your product in their real space — on their desk, in their room, at true scale. No app download required.
              </p>
              <div className="flex flex-wrap gap-3">
                {["GLB / glTF Models", "USDZ for iOS AR", "ARKit Integration", "Three.js Viewers", "Product Configurators", "WebXR"].map((tag) => (
                  <span key={tag} className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-medium text-gray-300">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
            <div className="relative mx-auto w-full max-w-md lg:max-w-none">
              <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm">
                <ModelViewer
                  modelUrl="https://tvcsf7shtoelkabr.public.blob.vercel-storage.com/models/Lac-Blk-Trainers.glb"
                  className="h-[350px] w-full sm:h-[400px] lg:h-[450px]"
                />
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
              Recent Work
            </p>
            <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl lg:text-5xl">
              Built to impress
            </h2>
          </div>

          {/* CircleRoot Showcase */}
          <a
            href="https://circlerootsoftware.site"
            target="_blank"
            rel="noopener noreferrer"
            className="group block"
          >
            <div className="relative overflow-hidden rounded-3xl shadow-2xl shadow-gray-300/50 transition-all duration-500 group-hover:shadow-3xl group-hover:shadow-gray-400/40 group-hover:-translate-y-1">
              <div className="relative aspect-[16/9] w-full">
                <Image
                  src="/images/circleroot-showcase.png"
                  alt="CircleRoot — Landscaping business management platform"
                  fill
                  className="object-cover object-top transition-transform duration-700 group-hover:scale-[1.02]"
                  sizes="(max-width: 768px) 100vw, 1200px"
                />
              </div>
              <div className="absolute inset-0 rounded-3xl ring-1 ring-inset ring-black/5" />
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent p-8 sm:p-10">
                <span className="mb-3 inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-1.5 text-xs font-semibold text-white backdrop-blur-md">
                  <span className="h-1.5 w-1.5 rounded-full bg-green-400" />
                  SaaS Platform
                </span>
                <h3 className="text-2xl font-bold text-white sm:text-3xl">CircleRoot Software</h3>
                <p className="mt-2 max-w-xl text-sm leading-relaxed text-white/80 sm:text-base">
                  A complete landscaping business management platform — invoicing, estimates, crew tracking, route management, and AI assistant. Built from the ground up.
                </p>
                <span className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-white/90 transition-colors group-hover:text-white">
                  Visit circlerootsoftware.site
                  <svg className="h-4 w-4 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
                  </svg>
                </span>
              </div>
            </div>
          </a>
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
              Our Process
            </p>
            <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl lg:text-5xl">
              From idea to launch,{" "}
              <span className="bg-gradient-to-r from-red-600 to-rose-500 bg-clip-text text-transparent">
                crystal clear.
              </span>
            </h2>
          </div>

          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {[
              {
                step: "01",
                title: "Discover",
                description: "We dive deep into your brand, audience, and goals to understand the full picture.",
                color: "bg-red-100 text-red-700",
                border: "border-red-200",
                icon: (
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
                  </svg>
                ),
              },
              {
                step: "02",
                title: "Design",
                description: "Pixel-perfect designs that balance beauty and function. Every interaction is intentional.",
                color: "bg-rose-100 text-rose-700",
                border: "border-rose-200",
                icon: (
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9.53 16.122a3 3 0 0 0-5.78 1.128 2.25 2.25 0 0 1-2.4 2.245 4.5 4.5 0 0 0 8.4-2.245c0-.399-.078-.78-.22-1.128Zm0 0a15.998 15.998 0 0 0 3.388-1.62m-5.043-.025a15.994 15.994 0 0 1 1.622-3.395m3.42 3.42a15.995 15.995 0 0 0 4.764-4.648l3.876-5.814a1.151 1.151 0 0 0-1.597-1.597L14.146 6.32a15.996 15.996 0 0 0-4.649 4.763m3.42 3.42a6.776 6.776 0 0 0-3.42-3.42" />
                  </svg>
                ),
              },
              {
                step: "03",
                title: "Develop",
                description: "Clean code, modern frameworks, blazing performance. AI search optimization baked in from day one.",
                color: "bg-rose-100 text-rose-700",
                border: "border-rose-200",
                icon: (
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="m6.75 7.5 3 2.25-3 2.25m4.5 0h3m-9 8.25h13.5A2.25 2.25 0 0 0 21 18V6a2.25 2.25 0 0 0-2.25-2.25H5.25A2.25 2.25 0 0 0 3 6v12a2.25 2.25 0 0 0 2.25 2.25Z" />
                  </svg>
                ),
              },
              {
                step: "04",
                title: "Launch & Grow",
                description: "Launch is just the beginning. We monitor, optimize, and help you scale continuously.",
                color: "bg-amber-100 text-amber-600",
                border: "border-amber-200",
                icon: (
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.59 14.37a6 6 0 0 1-5.84 7.38v-4.8m5.84-2.58a14.98 14.98 0 0 0 6.16-12.12A14.98 14.98 0 0 0 9.631 8.41m5.96 5.96a14.926 14.926 0 0 1-5.841 2.58m-.119-8.54a6 6 0 0 0-7.381 5.84h4.8m2.581-5.84a14.927 14.927 0 0 0-2.58 5.84m2.699 2.7c-.103.021-.207.041-.311.06a15.09 15.09 0 0 1-2.448-2.448 14.9 14.9 0 0 1 .06-.312m-2.24 2.39a4.493 4.493 0 0 0-1.757 4.306 4.493 4.493 0 0 0 4.306-1.758M16.5 9a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0Z" />
                  </svg>
                ),
              },
            ].map((item, i) => {
              // eslint-disable-next-line react-hooks/rules-of-hooks
              const { ref, inView } = useInView(0.2);
              return (
                <div
                  key={item.step}
                  ref={ref}
                  className={`rounded-2xl border ${item.border} bg-white p-6 transition-all duration-700 hover:shadow-lg ${
                    inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
                  }`}
                  style={{ transitionDelay: `${i * 100}ms` }}
                >
                  <div className={`mb-4 inline-flex rounded-xl ${item.color} p-3`}>
                    {item.icon}
                  </div>
                  <p className="mb-1 text-xs font-bold text-gray-400">{item.step}</p>
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
                Ready to build something{" "}
                <span className="bg-gradient-to-r from-red-400 via-rose-400 to-red-300 bg-clip-text text-transparent">
                  extraordinary?
                </span>
              </h2>
              <p className="mx-auto mt-5 max-w-xl text-lg text-gray-400">
                Let&apos;s talk about your vision. We&apos;ll craft a digital experience that
                sets your brand apart.
              </p>
              <div className="mt-10 mx-auto max-w-lg">
                <HomepageContactForm />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ FOOTER ═══ */}
      <SiteFooter />
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
