import { prisma } from "@/lib/prisma";
import { getSite } from "@/lib/get-site";
import { extractText } from "@/lib/render-content";
import { notFound } from "next/navigation";
import { Metadata } from "next";
import Link from "next/link";
import SiteHeader from "@/components/public/SiteHeader";
import SiteFooter from "@/components/public/SiteFooter";

interface CollectionProps {
  params: Promise<{ name: string }>;
}

export async function generateMetadata({ params }: CollectionProps): Promise<Metadata> {
  const { name } = await params;
  const site = await getSite();
  const displayName = decodeURIComponent(name);

  return {
    title: `${displayName} — ${site?.name || "Crystal Studios"}`,
    description: `Browse all ${displayName.toLowerCase()} pages`,
    alternates: {
      canonical: `/collection/${name}`,
    },
  };
}

export default async function CollectionPage({ params }: CollectionProps) {
  const { name } = await params;
  const site = await getSite();
  const collectionName = decodeURIComponent(name);

  const pages = await prisma.page.findMany({
    where: {
      collection: { equals: collectionName, mode: "insensitive" },
      status: "PUBLISHED",
    },
    orderBy: { publishedAt: "desc" },
    select: {
      title: true,
      slug: true,
      excerpt: true,
      content: true,
      contentType: true,
      publishedAt: true,
      author: { select: { name: true } },
    },
  });

  if (pages.length === 0) {
    notFound();
  }

  return (
    <div className="flex min-h-screen flex-col bg-white text-gray-900">
      <SiteHeader siteLogo={site?.logo} navigation={site?.navigation} />

      <main className="mx-auto w-full max-w-4xl flex-1 px-6 py-12">
        <header className="mb-10">
          <h1 className="text-3xl font-bold text-gray-900">{collectionName}</h1>
          <p className="mt-2 text-sm text-gray-500">
            {pages.length} page{pages.length !== 1 ? "s" : ""}
          </p>
        </header>

        <div className="space-y-8">
          {pages.map((page) => (
            <article key={page.slug} className="border-b border-gray-100 pb-8">
              <Link href={`/${page.slug}`}>
                <h2 className="text-xl font-semibold text-gray-900 hover:text-red-700 transition-colors">
                  {page.title}
                </h2>
              </Link>
              <p className="mt-2 text-gray-600 text-sm leading-relaxed">
                {page.excerpt || extractText(page.content, 200)}
              </p>
              <div className="mt-3 flex items-center gap-3 text-xs text-gray-400">
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
                <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-500">
                  {page.contentType}
                </span>
              </div>
            </article>
          ))}
        </div>
      </main>

      <SiteFooter siteLogo={site?.logo} />
    </div>
  );
}
