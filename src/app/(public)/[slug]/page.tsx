import { prisma } from "@/lib/prisma";
import { getSite } from "@/lib/get-site";
import { renderContent } from "@/lib/render-content";
import { notFound } from "next/navigation";
import { Metadata } from "next";
import Link from "next/link";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const site = await getSite();
  const page = await prisma.page.findFirst({
    where: { slug, status: "PUBLISHED" },
  });

  if (!page) return { title: "Not Found" };

  const title = page.metaTitle || `${page.title} — ${site?.name || "Crystal Studios"}`;
  const description = page.metaDescription || page.excerpt || "";

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: page.contentType === "ARTICLE" ? "article" : "website",
      ...(page.ogImage ? { images: [page.ogImage] } : {}),
      ...(page.contentType === "ARTICLE" && page.publishedAt
        ? { publishedTime: page.publishedAt.toISOString() }
        : {}),
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
    alternates: {
      canonical: `/${slug}`,
    },
  };
}

// Force dynamic rendering (SSR) — no static generation
export const dynamic = "force-dynamic";

export default async function DynamicPage({ params }: PageProps) {
  const { slug } = await params;
  const site = await getSite();

  const page = await prisma.page.findFirst({
    where: { slug, status: "PUBLISHED" },
    include: {
      author: { select: { name: true } },
      hub: {
        select: {
          name: true,
          slug: true,
          spokes: {
            where: { status: "PUBLISHED" },
            select: { id: true, title: true, slug: true },
            orderBy: { sortOrder: "asc" },
            take: 6,
          },
        },
      },
    },
  });

  if (!page) {
    notFound();
  }

  const html = renderContent(page.content);
  const isArticle = page.contentType === "ARTICLE";

  return (
    <div className="min-h-screen bg-white text-gray-900">
      {/* Minimal header for inner pages */}
      <header className="border-b border-gray-100">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-6 py-5">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-md bg-gradient-to-br from-red-700 to-red-900">
              <svg className="h-3.5 w-3.5 text-white" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09Z" />
              </svg>
            </div>
            <span className="text-lg font-bold text-gray-900 hover:text-gray-600 transition-colors">Crystal Studios</span>
          </Link>
          <nav aria-label="Main navigation">
            <ul className="flex items-center gap-6">
              {site?.navigation.map((item) => (
                <li key={item.id}>
                  <Link
                    href={item.url}
                    className="text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors"
                    {...(item.openNew ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </header>

      {/* JSON-LD Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            isArticle
              ? {
                  "@context": "https://schema.org",
                  "@type": "Article",
                  headline: page.title,
                  description: page.metaDescription || page.excerpt || "",
                  author: {
                    "@type": "Person",
                    name: page.author.name,
                  },
                  datePublished: page.publishedAt?.toISOString(),
                  dateModified: page.updatedAt.toISOString(),
                  publisher: {
                    "@type": "Organization",
                    name: site?.name || "Crystal Studios",
                  },
                  mainEntityOfPage: {
                    "@type": "WebPage",
                    "@id": `/${slug}`,
                  },
                  ...(page.ogImage ? { image: page.ogImage } : {}),
                }
              : {
                  "@context": "https://schema.org",
                  "@type": "WebPage",
                  name: page.title,
                  description: page.metaDescription || page.excerpt || "",
                  dateModified: page.updatedAt.toISOString(),
                  isPartOf: page.hub
                    ? {
                        "@type": "CollectionPage",
                        name: page.hub.name,
                        url: `/hub/${page.hub.slug}`,
                      }
                    : {
                        "@type": "WebSite",
                        name: site?.name || "Crystal Studios",
                      },
                  ...(page.hub
                    ? {
                        breadcrumb: {
                          "@type": "BreadcrumbList",
                          itemListElement: [
                            { "@type": "ListItem", position: 1, name: "Home", item: "/" },
                            { "@type": "ListItem", position: 2, name: page.hub.name, item: `/hub/${page.hub.slug}` },
                            { "@type": "ListItem", position: 3, name: page.title, item: `/${page.slug}` },
                          ],
                        },
                      }
                    : {}),
                }
          ),
        }}
      />

      <main className="mx-auto max-w-4xl px-6 py-12">
        {/* Hub Breadcrumb */}
        {page.hub && (
          <nav className="mb-6" aria-label="Breadcrumb">
            <ol className="flex items-center gap-2 text-sm text-gray-500">
              <li><Link href="/" className="hover:text-gray-700">Home</Link></li>
              <li><span className="text-gray-300">/</span></li>
              <li><Link href={`/hub/${page.hub.slug}`} className="hover:text-gray-700">{page.hub.name}</Link></li>
              <li><span className="text-gray-300">/</span></li>
              <li className="font-medium text-gray-900">{page.title}</li>
            </ol>
          </nav>
        )}

        <article>
          <header className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 sm:text-4xl">
              {page.title}
            </h1>
            {isArticle && (
              <div className="mt-3 flex items-center gap-3 text-sm text-gray-500">
                <span>By {page.author.name}</span>
                {page.publishedAt && (
                  <>
                    <span>·</span>
                    <time dateTime={page.publishedAt.toISOString()}>
                      {page.publishedAt.toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </time>
                  </>
                )}
              </div>
            )}
          </header>

          <section
            className="prose prose-lg max-w-none prose-headings:text-gray-900 prose-p:text-gray-600 prose-a:text-red-600"
            dangerouslySetInnerHTML={{ __html: html }}
          />
        </article>

        {/* Related pages from same hub */}
        {page.hub && page.hub.spokes.filter((s) => s.id !== page.id).length > 0 && (
          <aside className="mt-16 border-t border-gray-100 pt-10">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">
                More from <Link href={`/hub/${page.hub.slug}`} className="text-red-700 hover:text-red-800">{page.hub.name}</Link>
              </h2>
              <Link
                href={`/hub/${page.hub.slug}`}
                className="text-sm font-medium text-red-600 hover:text-red-700"
              >
                View all →
              </Link>
            </div>
            <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {page.hub.spokes
                .filter((s) => s.id !== page.id)
                .slice(0, 3)
                .map((spoke) => (
                  <Link
                    key={spoke.id}
                    href={`/${spoke.slug}`}
                    className="group rounded-xl border border-gray-200 p-5 transition-all hover:border-gray-300 hover:shadow-sm"
                  >
                    <h3 className="font-medium text-gray-900 group-hover:text-red-700">
                      {spoke.title}
                    </h3>
                  </Link>
                ))}
            </div>
          </aside>
        )}
      </main>

      <footer className="border-t border-gray-100 bg-gray-50 py-8">
        <div className="mx-auto max-w-4xl px-6">
          <p className="text-center text-xs text-gray-400">
            &copy; {new Date().getFullYear()} Crystal Studios. Powered by <a href="https://parsley.dev" className="text-red-600 hover:text-red-700">Parsley</a>.
          </p>
        </div>
      </footer>
    </div>
  );
}
