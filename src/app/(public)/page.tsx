import { Metadata } from "next";
import CrystalHomepage from "@/components/public/CrystalHomepage";

export const metadata: Metadata = {
  title: "Crystal Studios — We Build Digital Experiences That Move People",
  description:
    "Crystal Studios is a full-spectrum digital agency specializing in web design, app development, AR/3D products, AI-powered video, and strategic online presence.",
  openGraph: {
    title: "Crystal Studios — We Build Digital Experiences That Move People",
    description:
      "Crystal Studios is a full-spectrum digital agency specializing in web design, app development, AR/3D products, AI-powered video, and strategic online presence.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Crystal Studios — We Build Digital Experiences That Move People",
    description:
      "Full-spectrum digital agency: web design, apps, AR/3D, AI video, and online strategy.",
  },
  alternates: {
    canonical: "/",
    types: {
      "application/rss+xml": "/feed.xml",
    },
  },
};

// Homepage JSON-LD: WebSite + Organization + BreadcrumbList
function HomepageJsonLd() {
  const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3001";

  const schemas = [
    {
      "@context": "https://schema.org",
      "@type": "WebSite",
      name: "Crystal Studios",
      url: baseUrl,
      description:
        "Full-spectrum digital agency specializing in web design, app development, AR/3D products, AI-powered video, and strategic online presence.",
      potentialAction: {
        "@type": "SearchAction",
        target: `${baseUrl}/search?q={search_term_string}`,
        "query-input": "required name=search_term_string",
      },
    },
    {
      "@context": "https://schema.org",
      "@type": "Organization",
      name: "Crystal Studios",
      url: baseUrl,
      description:
        "We build digital experiences that move people. Web design, apps, AR/3D, AI video, and online strategy.",
      foundingDate: "2014",
      contactPoint: {
        "@type": "ContactPoint",
        contactType: "customer service",
        email: "hello@crystalstudios.dev",
      },
      sameAs: [],
      knowsAbout: [
        "Web Design",
        "Web Development",
        "Mobile App Development",
        "Augmented Reality",
        "3D Product Visualization",
        "AI Video Production",
        "Digital Strategy",
        "Brand Identity",
        "SEO",
        "ARKit",
        "USDZ",
        "Three.js",
        "React",
        "Next.js",
      ],
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        {
          "@type": "ListItem",
          position: 1,
          name: "Home",
          item: baseUrl,
        },
      ],
    },
  ];

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schemas) }}
    />
  );
}

export default function HomePage() {
  return (
    <>
      <HomepageJsonLd />
      <CrystalHomepage />
    </>
  );
}
