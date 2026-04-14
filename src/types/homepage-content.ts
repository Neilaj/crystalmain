export interface HomepageContent {
  hero: {
    badge: string;
    headline: string;
    highlight: string;
    subtext: string;
    cta1Text: string;
    cta2Text: string;
    heroImageUrl: string;
  };
  services: {
    eyebrow: string;
    headline: string;
    highlight: string;
    items: Array<{
      tag: string;
      title: string;
      description: string;
      imageUrl: string;
      href?: string;
    }>;
  };
  parsley: {
    eyebrow: string;
    headline: string;
    highlight: string;
    para1: string;
    para2: string;
    features: Array<{ title: string; desc: string }>;
  };
  ar: {
    badge: string;
    headline: string;
    highlight1: string;
    highlight2: string;
    para1: string;
    para2: string;
    tags: string[];
  };
  showcase: {
    eyebrow: string;
    headline: string;
    items: Array<{
      href: string;
      title: string;
      description: string;
      imageUrl: string;
      tag: string;
    }>;
  };
  process: {
    eyebrow: string;
    headline: string;
    highlight: string;
    steps: Array<{ step: string; title: string; description: string }>;
  };
  cta: {
    headline: string;
    highlight: string;
    subtext: string;
  };
  contact: {
    email: string;
  };
}

export const DEFAULT_HOMEPAGE_CONTENT: HomepageContent = {
  hero: {
    badge: "Now accepting projects for 2026",
    headline: "We build",
    highlight: "digital experiences",
    subtext:
      "Web design, custom software, mobile apps, interactive 3D product experiences, AR on iOS, AI-powered video — everything your business needs to dominate online.",
    cta1Text: "Start a project",
    cta2Text: "View our work",
    heroImageUrl: "/images/hero-person.png",
  },
  services: {
    eyebrow: "What we do",
    headline: "Everything your brand needs to",
    highlight: "dominate online",
    items: [
      {
        tag: "Web",
        title: "Web Design & Development",
        description:
          "Pixel-perfect, blazing-fast websites built with modern frameworks. Optimized for AI search engines so your content gets cited, not buried.",
        imageUrl:
          "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=600&h=400&fit=crop",
      },
      {
        tag: "Mobile",
        title: "App Development",
        description:
          "Native and cross-platform mobile apps that users love. From concept to App Store, experiences that feel intuitive and perform flawlessly.",
        imageUrl:
          "https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=600&h=400&fit=crop",
      },
      {
        tag: "AR / 3D",
        title: "3D for Web & AR on iOS",
        description:
          "We build interactive 3D product viewers for the web and native AR experiences on iOS using ARKit and USDZ. Customers can place your products in their real space before buying.",
        imageUrl:
          "https://images.unsplash.com/photo-1617802690992-15d93263d3a9?w=600&h=400&fit=crop",
      },
      {
        tag: "AI Video",
        title: "AI Video Production",
        description:
          "AI-generated social media videos that stop the scroll. Thumb-stopping content at scale — reels, shorts, and stories that convert.",
        imageUrl:
          "https://images.unsplash.com/photo-1626379953822-baec19c3accd?w=600&h=400&fit=crop",
      },
      {
        tag: "Strategy",
        title: "Digital Strategy",
        description:
          "SEO, analytics, conversion optimization, and growth planning. We don't just build — we help you win with data-driven strategy.",
        imageUrl:
          "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=600&h=400&fit=crop",
      },
      {
        tag: "Software",
        title: "Custom Software Development",
        description:
          "We build complete SaaS platforms and business management tools from the ground up. Invoicing, CRM, scheduling, crew management — whatever your business needs to run smarter.",
        imageUrl: "/images/custom-software-box.png",
      },
    ],
  },
  parsley: {
    eyebrow: "Our Advantage",
    headline: "Built on",
    highlight: "Parsley",
    para1:
      "Every website we build runs on Parsley — our proprietary CMS platform engineered from the ground up to be visible to AI search engines like ChatGPT, Perplexity, and Google AI Overviews.",
    para2:
      "While other agencies build on WordPress and hope for the best, we give your business a structural advantage. Your site automatically generates the structured data, content hubs, and semantic markup that AI engines need to find, understand, and cite your content.",
    features: [
      {
        title: "AI Search Optimized",
        desc: "Auto-generated llms.txt, Schema.org JSON-LD, and semantic HTML — your content gets cited, not buried",
      },
      {
        title: "Blazing Fast",
        desc: "Server-side rendered with Next.js and edge caching. Sub-second load times, every page",
      },
      {
        title: "Unhackable by Design",
        desc: "No PHP, no plugin vulnerabilities, no security patches. Modern TypeScript stack that stays secure",
      },
      {
        title: "Structured for AI Discovery",
        desc: "Every site is organized so AI engines like ChatGPT and Perplexity can understand, navigate, and cite your content with confidence",
      },
      {
        title: "Mobile-First by Design",
        desc: "Every site is responsive from day one. Google uses mobile-first indexing — our sites are built for it, not retrofitted",
      },
    ],
  },
  ar: {
    badge: "3D & Augmented Reality",
    headline: "Your products in",
    highlight1: "3D on the web",
    highlight2: "AR on iOS",
    para1:
      "We create photorealistic 3D models of your physical products and deploy them as interactive viewers on your website — customers can rotate, zoom, and inspect every detail.",
    para2:
      "For iOS, we build native AR experiences using ARKit and USDZ. Your customers tap a button and see your product in their real space — on their desk, in their room, at true scale. No app download required.",
    tags: [
      "GLB / glTF Models",
      "USDZ for iOS AR",
      "ARKit Integration",
      "Three.js Viewers",
      "Product Configurators",
      "WebXR",
    ],
  },
  showcase: {
    eyebrow: "Recent Work",
    headline: "Built on Parsley CMS",
    items: [
      {
        href: "https://circlerootsoftware.site",
        title: "CircleRoot Software",
        description:
          "A complete landscaping business management platform — invoicing, estimates, crew tracking, route management, and AI assistant.",
        imageUrl: "/images/circleroot-showcase.png",
        tag: "SaaS Platform",
      },
      {
        href: "https://apmazzilli.com",
        title: "AP Mazzilli Landscaping",
        description:
          "Full-service landscaping website with AI assistant, hub/spoke SEO architecture, online estimates, and content management.",
        imageUrl: "/images/apmazzilli-showcase.png",
        tag: "Landscaping",
      },
      {
        href: "https://rblandscaping.site",
        title: "R&B Landscaping",
        description:
          "Spring-themed landscaping site with AI chat, gallery, homepage editor, and Resend-powered lead capture.",
        imageUrl: "/images/rblandscaping-showcase.png",
        tag: "Landscaping",
      },
    ],
  },
  process: {
    eyebrow: "Our Process",
    headline: "From idea to launch,",
    highlight: "crystal clear.",
    steps: [
      {
        step: "01",
        title: "Discover",
        description:
          "We dive deep into your brand, audience, and goals to understand the full picture.",
      },
      {
        step: "02",
        title: "Design",
        description:
          "Pixel-perfect designs that balance beauty and function. Every interaction is intentional.",
      },
      {
        step: "03",
        title: "Develop",
        description:
          "Clean code, modern frameworks, blazing performance. AI search optimization baked in from day one.",
      },
      {
        step: "04",
        title: "Launch & Grow",
        description:
          "Launch is just the beginning. We monitor, optimize, and help you scale continuously.",
      },
    ],
  },
  cta: {
    headline: "Ready to build something",
    highlight: "extraordinary?",
    subtext:
      "Let's talk about your vision. We'll craft a digital experience that sets your brand apart.",
  },
  contact: {
    email: "crystalwebdesign875@gmail.com",
  },
};
