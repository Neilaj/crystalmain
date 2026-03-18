import { prisma } from "@/lib/prisma";
import { getSite } from "@/lib/get-site";
import { notFound } from "next/navigation";
import { Metadata } from "next";
import Link from "next/link";

interface HubPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: HubPageProps): Promise<Metadata> {
  const { slug } = await params;
  const site = await getSite();
  const hub = await prisma.hub.findFirst({
    where: { slug },
  });

  if (!hub) return { title: "Not Found" };

  const title = hub.metaTitle || `${hub.name} — ${site?.name || "Parsley"}`;
  const description = hub.metaDescription || hub.description || "";

  return {
    title,
    description,
    openGraph: { title, description, type: "website" },
  };
}

export default async function HubPage({ params }: HubPageProps) {
  const { slug } = await params;
  const site = await getSite();

  const hub = await prisma.hub.findFirst({
    where: { slug },
    include: {
      pillarPage: true,
      spokes: {
        where: { status: "PUBLISHED" },
        orderBy: { sortOrder: "asc" },
      },
    },
  });

  if (!hub) notFound();

  const siteName = site?.name || "Parsley";
  const navItems = site?.navigation || [];

  // JSON-LD for the hub — ItemList + CollectionPage
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: hub.name,
    description: hub.description || `Everything about ${hub.name}`,
    url: `/hub/${hub.slug}`,
    isPartOf: {
      "@type": "WebSite",
      name: siteName,
    },
    mainEntity: {
      "@type": "ItemList",
      name: hub.name,
      numberOfItems: hub.spokes.length,
      itemListElement: hub.spokes.map((spoke, i) => ({
        "@type": "ListItem",
        position: i + 1,
        url: `/${spoke.slug}`,
        name: spoke.title,
        description: spoke.excerpt || spoke.metaDescription || "",
      })),
    },
    breadcrumb: {
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: "/" },
        { "@type": "ListItem", position: 2, name: hub.name, item: `/hub/${hub.slug}` },
      ],
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-gray-100 bg-white/80 backdrop-blur-lg">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
          <Link href="/" className="text-lg font-bold text-gray-900">{siteName}</Link>
          <nav className="hidden items-center gap-8 md:flex">
            {navItems.map((item) => (
              <Link key={item.id} href={item.url} className="text-sm text-gray-600 hover:text-gray-900">
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6">
        {/* Breadcrumb */}
        <nav className="py-4" aria-label="Breadcrumb">
          <ol className="flex items-center gap-2 text-sm text-gray-500">
            <li><Link href="/" className="hover:text-gray-700">Home</Link></li>
            <li><span className="text-gray-300">/</span></li>
            <li className="font-medium text-gray-900">{hub.name}</li>
          </ol>
        </nav>

        {/* Hub Header */}
        <section className="pb-12 pt-8">
          <div className="max-w-3xl">
            <span className="mb-3 inline-block rounded-full bg-green-100 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-green-700">
              Topic Hub
            </span>
            <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">
              {hub.name}
            </h1>
            {hub.description && (
              <p className="mt-4 text-lg leading-relaxed text-gray-600">
                {hub.description}
              </p>
            )}
            <p className="mt-3 text-sm text-gray-400">
              {hub.spokes.length} article{hub.spokes.length !== 1 ? "s" : ""} in this topic
            </p>
          </div>
        </section>

        {/* Pillar Page (if set) */}
        {hub.pillarPage && hub.pillarPage.status === "PUBLISHED" && (
          <section className="mb-12">
            <Link
              href={`/${hub.pillarPage.slug}`}
              className="group block rounded-2xl border border-gray-200 bg-gradient-to-br from-green-50 to-white p-8 transition-shadow hover:shadow-lg"
            >
              <span className="text-xs font-semibold uppercase tracking-wide text-green-600">Pillar Guide</span>
              <h2 className="mt-2 text-2xl font-bold text-gray-900 group-hover:text-green-700">
                {hub.pillarPage.title}
              </h2>
              {hub.pillarPage.excerpt && (
                <p className="mt-3 text-gray-600">{hub.pillarPage.excerpt}</p>
              )}
              <span className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-green-600">
                Read the complete guide
                <svg className="h-4 w-4 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
                </svg>
              </span>
            </Link>
          </section>
        )}

        {/* Spoke Pages Grid */}
        <section className="pb-20">
          <h2 className="mb-8 text-xl font-semibold text-gray-900">
            All articles in {hub.name}
          </h2>

          {hub.spokes.length === 0 ? (
            <div className="rounded-2xl border-2 border-dashed border-gray-200 py-16 text-center">
              <p className="text-gray-500">No published articles in this hub yet.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {hub.spokes
                .filter((s) => s.id !== hub.pillarPageId) // Don't repeat pillar page
                .map((spoke) => (
                  <Link
                    key={spoke.id}
                    href={`/${spoke.slug}`}
                    className="group rounded-xl border border-gray-200 bg-white p-6 transition-all hover:border-gray-300 hover:shadow-md"
                  >
                    <span className="text-xs font-medium uppercase tracking-wide text-gray-400">
                      {spoke.contentType}
                    </span>
                    <h3 className="mt-2 text-lg font-semibold text-gray-900 group-hover:text-green-700">
                      {spoke.title}
                    </h3>
                    {spoke.excerpt && (
                      <p className="mt-2 line-clamp-3 text-sm text-gray-500">
                        {spoke.excerpt}
                      </p>
                    )}
                    <span className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-green-600">
                      Read more
                      <svg className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
                      </svg>
                    </span>
                  </Link>
                ))}
            </div>
          )}
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-100 bg-gray-50 py-12">
        <div className="mx-auto max-w-6xl px-6 text-center text-sm text-gray-500">
          {site?.footerText || `© ${new Date().getFullYear()} ${siteName}. All rights reserved.`}
        </div>
      </footer>
    </>
  );
}
