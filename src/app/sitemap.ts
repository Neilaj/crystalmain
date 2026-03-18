import { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3001";

  // Get all published pages
  const pages = await prisma.page.findMany({
    where: { status: "PUBLISHED" },
    select: {
      slug: true,
      updatedAt: true,
      contentType: true,
    },
    orderBy: { updatedAt: "desc" },
  });

  // Get unique collections
  const collections = await prisma.page.findMany({
    where: { status: "PUBLISHED", collection: { not: null } },
    select: { collection: true },
    distinct: ["collection"],
  });

  const sitemapEntries: MetadataRoute.Sitemap = [
    // Homepage
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1,
    },
  ];

  // Published pages
  for (const page of pages) {
    if (page.slug === "") continue; // Skip homepage, already added
    sitemapEntries.push({
      url: `${baseUrl}/${page.slug}`,
      lastModified: page.updatedAt,
      changeFrequency: page.contentType === "ARTICLE" ? "weekly" : "monthly",
      priority: page.contentType === "LANDING" ? 0.9 : 0.7,
    });
  }

  // Collection pages
  for (const { collection } of collections) {
    if (collection) {
      sitemapEntries.push({
        url: `${baseUrl}/collection/${encodeURIComponent(collection)}`,
        lastModified: new Date(),
        changeFrequency: "weekly",
        priority: 0.6,
      });
    }
  }

  // Hub pages
  const hubs = await prisma.hub.findMany({
    select: { slug: true, updatedAt: true },
  });

  for (const hub of hubs) {
    sitemapEntries.push({
      url: `${baseUrl}/hub/${hub.slug}`,
      lastModified: hub.updatedAt,
      changeFrequency: "weekly",
      priority: 0.8, // Hubs are high-priority pillar content
    });
  }

  return sitemapEntries;
}
