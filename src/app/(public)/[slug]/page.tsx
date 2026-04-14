import { prisma } from "@/lib/prisma";
import { getSite } from "@/lib/get-site";
import { renderContent } from "@/lib/render-content";
import { notFound } from "next/navigation";
import { Metadata } from "next";
import Link from "next/link";
import PageContent from "@/components/public/PageContent";
import SiteHeader from "@/components/public/SiteHeader";
import SiteFooter from "@/components/public/SiteFooter";
import AskChrissy from "@/components/public/AskChrissy";

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
    <div className="flex min-h-screen flex-col bg-white text-gray-900">
      <SiteHeader siteLogo={site?.logo} navigation={site?.navigation} />

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

      <main className="mx-auto max-w-6xl px-6 py-12">
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

          <section>
            <PageContent html={html} />
          </section>
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

      <SiteFooter
        siteLogo={site?.logo}
        socialTwitter={site?.socialTwitter}
        socialLinkedin={site?.socialLinkedin}
        socialGithub={site?.socialGithub}
        socialYoutube={site?.socialYoutube}
      />
      <AskChrissy />
    </div>
  );
}
