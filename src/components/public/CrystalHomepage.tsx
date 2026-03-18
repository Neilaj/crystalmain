"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import dynamic from "next/dynamic";

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
export default function CrystalHomepage() {
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
            <a href="#services" className="text-sm font-medium text-gray-400 hover:text-white transition-colors">Services</a>
            <a href="#work" className="text-sm font-medium text-gray-400 hover:text-white transition-colors">Work</a>
            <a href="#process" className="text-sm font-medium text-gray-400 hover:text-white transition-colors">Process</a>
            <a
              href="#contact"
              className="rounded-full bg-red-700 px-5 py-2 text-sm font-semibold text-white transition-all hover:bg-red-600 hover:shadow-lg hover:shadow-red-900/20"
            >
              Get in touch
            </a>
          </div>
        </div>
      </nav>

      {/* ═══ HERO SECTION ═══ */}
      <section className="relative min-h-screen overflow-hidden pt-20">
        {/* Subtle gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-red-50/80 via-white to-rose-50/60" />
        <div className="absolute top-20 right-0 h-[600px] w-[600px] rounded-full bg-gradient-to-br from-red-100 to-transparent opacity-60 blur-3xl" />
        <div className="absolute bottom-0 left-0 h-[400px] w-[400px] rounded-full bg-gradient-to-tr from-rose-100 to-transparent opacity-40 blur-3xl" />

        <div className="relative z-10 mx-auto flex max-w-6xl flex-col items-center px-6 pt-24 lg:flex-row lg:items-center lg:gap-16 lg:pt-32">
          {/* Left — Text */}
          <div className="flex-1 text-center lg:text-left">
            <div
              className={`mb-6 inline-flex items-center gap-2 rounded-full border border-red-200 bg-red-50 px-4 py-1.5 transition-all duration-1000 ${
                loaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
              }`}
            >
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-red-600" />
              </span>
              <span className="text-xs font-semibold tracking-wide text-red-700">
                Now accepting projects for 2026
              </span>
            </div>

            <h1
              className={`mb-6 text-4xl font-extrabold leading-[1.1] tracking-tight text-gray-900 sm:text-5xl lg:text-6xl transition-all duration-1000 delay-200 ${
                loaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
              }`}
            >
              We build{" "}
              <span className="bg-gradient-to-r from-red-700 via-red-600 to-rose-500 bg-clip-text text-transparent">
                digital experiences
              </span>{" "}
              that move people.
            </h1>

            <p
              className={`mb-8 max-w-lg text-lg leading-relaxed text-gray-500 sm:text-xl lg:mx-0 mx-auto transition-all duration-1000 delay-400 ${
                loaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
              }`}
            >
              Web design, mobile apps, interactive 3D product experiences, AR on iOS, AI-powered video — everything your business needs to dominate online.
            </p>

            <div
              className={`flex flex-col items-center gap-3 sm:flex-row lg:justify-start justify-center transition-all duration-1000 delay-500 ${
                loaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
              }`}
            >
              <a
                href="#contact"
                className="group inline-flex items-center gap-2 rounded-full bg-gray-900 px-7 py-3.5 text-sm font-semibold text-white transition-all hover:bg-gray-700 hover:shadow-xl hover:shadow-gray-900/10"
              >
                Start a project
                <svg className="h-4 w-4 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
                </svg>
              </a>
              <a
                href="#work"
                className="inline-flex items-center gap-2 rounded-full border border-gray-200 px-7 py-3.5 text-sm font-semibold text-gray-700 transition-all hover:border-gray-300 hover:bg-gray-50"
              >
                View our work
              </a>
            </div>
          </div>

          {/* Right — Interactive 3D Model */}
          <div
            className={`mt-12 flex-1 lg:mt-0 transition-all duration-1000 delay-300 ${
              loaded ? "opacity-100 translate-x-0 scale-100" : "opacity-0 translate-x-12 scale-95"
            }`}
          >
            <div className="relative mx-auto max-w-lg">
              {/* 3D Model Viewer */}
              <div className="relative overflow-hidden rounded-2xl border border-gray-100 bg-gradient-to-br from-gray-50 to-white shadow-2xl shadow-gray-200/60">
                <ModelViewer
                  modelUrl="/models/Lac-Blk-Trainers.glb"
                  className="h-[400px] w-full sm:h-[450px]"
                />
              </div>
              {/* Badge */}
              <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2 rounded-full border border-gray-200 bg-white px-4 py-2 shadow-lg">
                <div className="flex h-5 w-5 items-center justify-center rounded-full bg-gradient-to-br from-red-600 to-red-800">
                  <svg className="h-3 w-3 text-white" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 7.5l-2.25-1.313M21 7.5v2.25m0-2.25l-2.25 1.313M3 7.5l2.25-1.313M3 7.5l2.25 1.313M3 7.5v2.25m9 3l2.25-1.313M12 12.75l-2.25-1.313M12 12.75V15m0 6.75l2.25-1.313M12 21.75V19.5m0 2.25l-2.25-1.313m0-16.875L12 2.25l2.25 1.313M21 14.25v2.25l-2.25 1.313m-13.5 0L3 16.5v-2.25" />
                  </svg>
                </div>
                <span className="text-xs font-semibold text-gray-700">Interactive 3D — Built by Crystal Studios</span>
              </div>
              {/* Background decorative blobs */}
              <div className="absolute -top-10 -right-10 h-40 w-40 rounded-full bg-red-100 opacity-60 blur-2xl" />
              <div className="absolute -bottom-10 -left-10 h-32 w-32 rounded-full bg-rose-100 opacity-60 blur-2xl" />
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
            <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-gray-400">Scroll</span>
            <div className="h-10 w-[1px] bg-gradient-to-b from-gray-300 to-transparent scroll-line" />
          </div>
        </div>
      </section>

      {/* ═══ CLIENTS / TRUST BAR ═══ */}
      <section className="border-y border-gray-100 bg-gray-50/50 py-12 overflow-hidden">
        <p className="mb-6 text-center text-[11px] font-semibold uppercase tracking-[0.2em] text-gray-400">
          Technologies we work with
        </p>
        <div className="marquee-container">
          <div className="marquee-track">
            {[
              "React", "Next.js", "TypeScript", "Swift", "Kotlin", "Flutter",
              "Three.js", "ARKit", "Unity", "Figma", "TailwindCSS", "Node.js",
              "PostgreSQL", "AWS", "Vercel", "OpenAI", "Blender", "Docker",
              "React", "Next.js", "TypeScript", "Swift", "Kotlin", "Flutter",
              "Three.js", "ARKit", "Unity", "Figma", "TailwindCSS", "Node.js",
              "PostgreSQL", "AWS", "Vercel", "OpenAI", "Blender", "Docker",
            ].map((tech, i) => (
              <span
                key={`${tech}-${i}`}
                className="mx-8 whitespace-nowrap text-base font-semibold text-gray-300 sm:text-lg"
              >
                {tech}
              </span>
            ))}
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
              tag="Branding"
              image="https://images.unsplash.com/photo-1558655146-9f40138edfeb?w=600&h=400&fit=crop"
              title="Brand & Identity"
              description="From logo design to complete brand systems. Visual identities that resonate with your audience and stand the test of time."
            />
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
          <div className="grid items-center gap-12 lg:grid-cols-2">
            <div>
              <span className="mb-4 inline-flex items-center gap-2 rounded-full border border-red-400/30 bg-red-600/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-red-300">
                <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 7.5l-2.25-1.313M21 7.5v2.25m0-2.25l-2.25 1.313M3 7.5l2.25-1.313M3 7.5l2.25 1.313M3 7.5v2.25m9 3l2.25-1.313M12 12.75l-2.25-1.313M12 12.75V15m0 6.75l2.25-1.313M12 21.75V19.5m0 2.25l-2.25-1.313m0-16.875L12 2.25l2.25 1.313M21 14.25v2.25l-2.25 1.313m-13.5 0L3 16.5v-2.25" />
                </svg>
                3D & Augmented Reality
              </span>
              <h2 className="mb-6 text-3xl font-extrabold leading-tight sm:text-4xl lg:text-5xl">
                Your products in{" "}
                <span className="bg-gradient-to-r from-red-400 to-rose-400 bg-clip-text text-transparent">
                  3D on the web
                </span>{" "}
                and{" "}
                <span className="bg-gradient-to-r from-rose-400 to-red-500 bg-clip-text text-transparent">
                  AR on iOS
                </span>
              </h2>
              <p className="mb-6 text-lg leading-relaxed text-gray-300">
                We create photorealistic 3D models of your physical products and deploy them as interactive viewers on your website — customers can rotate, zoom, and inspect every detail.
              </p>
              <p className="mb-8 text-lg leading-relaxed text-gray-300">
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
            <div className="relative">
              <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm">
                <ModelViewer
                  modelUrl="/models/K70884-Fin.glb"
                  className="h-[400px] w-full"
                />
              </div>
              <div className="mt-4 flex items-center justify-center gap-6 text-sm text-gray-400">
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

          {/* Bento Grid */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 lg:grid-rows-2">
            {/* Large item */}
            <div className="relative overflow-hidden rounded-2xl lg:col-span-2 lg:row-span-2 group">
              <Image
                src="https://images.unsplash.com/photo-1467232004584-a241de8bcf5d?w=1000&h=800&fit=crop"
                alt="E-commerce platform redesign"
                fill
                className="object-cover transition-transform duration-700 group-hover:scale-105"
                sizes="(max-width: 768px) 100vw, 66vw"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
              <div className="absolute bottom-0 left-0 p-8">
                <span className="mb-2 inline-block rounded-full bg-white/20 px-3 py-1 text-xs font-semibold text-white backdrop-blur-sm">
                  E-Commerce
                </span>
                <h3 className="text-2xl font-bold text-white">Full-Stack E-Commerce Platform</h3>
                <p className="mt-2 max-w-md text-sm text-white/80">
                  A complete redesign with 3D product previews, AI-powered recommendations, and a 40% increase in conversion rate.
                </p>
              </div>
            </div>
            {/* Small items */}
            <div className="relative h-64 overflow-hidden rounded-2xl group">
              <Image
                src="https://images.unsplash.com/photo-1616469829581-73993eb86b02?w=600&h=400&fit=crop"
                alt="Mobile banking app"
                fill
                className="object-cover transition-transform duration-700 group-hover:scale-105"
                sizes="33vw"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              <div className="absolute bottom-0 left-0 p-5">
                <span className="mb-1 inline-block rounded-full bg-white/20 px-3 py-1 text-[10px] font-semibold text-white backdrop-blur-sm">
                  Mobile App
                </span>
                <h3 className="text-lg font-bold text-white">Banking App Redesign</h3>
              </div>
            </div>
            <div className="relative h-64 overflow-hidden rounded-2xl group">
              <Image
                src="https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=600&h=400&fit=crop"
                alt="Brand identity design"
                fill
                className="object-cover transition-transform duration-700 group-hover:scale-105"
                sizes="33vw"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              <div className="absolute bottom-0 left-0 p-5">
                <span className="mb-1 inline-block rounded-full bg-white/20 px-3 py-1 text-[10px] font-semibold text-white backdrop-blur-sm">
                  Branding
                </span>
                <h3 className="text-lg font-bold text-white">Startup Brand System</h3>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ STATS SECTION ═══ */}
      <section className="border-y border-gray-100 py-20">
        <div
          ref={statsSection.ref}
          className={`mx-auto max-w-6xl px-6 transition-all duration-1000 ${
            statsSection.inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
          }`}
        >
          <div className="grid grid-cols-2 gap-8 lg:grid-cols-4">
            {[
              { value: 150, suffix: "+", label: "Projects Delivered" },
              { value: 98, suffix: "%", label: "Client Satisfaction" },
              { value: 12, suffix: "", label: "Years of Experience" },
              { value: 40, suffix: "M+", label: "Users Reached" },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <p className="text-4xl font-extrabold text-gray-900 sm:text-5xl lg:text-6xl">
                  <Counter target={stat.value} suffix={stat.suffix} />
                </p>
                <p className="mt-2 text-sm font-medium text-gray-400">{stat.label}</p>
              </div>
            ))}
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
              <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
                <a
                  href="mailto:hello@crystalstudios.dev"
                  className="group inline-flex items-center gap-3 rounded-full bg-white px-8 py-4 text-sm font-bold text-gray-900 transition-all hover:scale-105 hover:shadow-xl"
                >
                  Get in touch
                  <svg className="h-4 w-4 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
                  </svg>
                </a>
                <a
                  href="tel:+1234567890"
                  className="inline-flex items-center gap-2 text-sm font-medium text-gray-400 hover:text-white transition-colors"
                >
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 0 0 2.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 0 1-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 0 0-1.091-.852H4.5A2.25 2.25 0 0 0 2.25 4.5v2.25Z" />
                  </svg>
                  Or call us directly
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ FOOTER ═══ */}
      <footer className="border-t border-gray-100 bg-gray-50 py-12">
        <div className="mx-auto max-w-6xl px-6">
          <div className="flex flex-col items-center justify-between gap-6 sm:flex-row">
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-md bg-gradient-to-br from-red-700 to-red-900">
                <svg className="h-3.5 w-3.5 text-white" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09Z" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-bold text-gray-900">Crystal Studios</p>
                <p className="text-xs text-gray-400">Web &bull; Apps &bull; AR/3D &bull; AI Video &bull; Strategy</p>
              </div>
            </div>
            <div className="flex items-center gap-5">
              <a href="#" className="text-gray-400 hover:text-gray-600 transition-colors" aria-label="Twitter">
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
              </a>
              <a href="#" className="text-gray-400 hover:text-gray-600 transition-colors" aria-label="Instagram">
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>
              </a>
              <a href="#" className="text-gray-400 hover:text-gray-600 transition-colors" aria-label="LinkedIn">
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
              </a>
            </div>
          </div>
          <div className="mt-8 border-t border-gray-200 pt-6">
            <p className="text-center text-xs text-gray-400">
              &copy; {new Date().getFullYear()} Crystal Studios. All rights reserved. Powered by <a href="https://parsley.dev" className="text-red-600 hover:text-red-700">Parsley</a>.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
