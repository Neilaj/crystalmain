import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSite } from "@/lib/get-site";
import { extractText } from "@/lib/render-content";

export const dynamic = "force-dynamic";

export async function GET() {
  const site = await getSite();
  const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3001";

  if (!site) {
    return new NextResponse("Site not configured", { status: 404 });
  }

  // Fetch pages with hub info
  const pages = await prisma.page.findMany({
    where: { status: "PUBLISHED" },
    orderBy: { publishedAt: "desc" },
    select: {
      title: true,
      slug: true,
      contentType: true,
      metaDescription: true,
      excerpt: true,
      content: true,
      collection: true,
      publishedAt: true,
      hubId: true,
      author: { select: { name: true } },
    },
  });

  // Fetch hubs with spoke info
  const hubs = await prisma.hub.findMany({
    where: { siteId: site.id },
    include: {
      pillarPage: { select: { title: true, slug: true } },
      spokes: {
        where: { status: "PUBLISHED" },
        select: { title: true, slug: true, metaDescription: true, excerpt: true, content: true },
        orderBy: { sortOrder: "asc" },
      },
    },
  });

  // Collect page IDs that belong to hubs
  const hubPageSlugs = new Set<string>();
  for (const hub of hubs) {
    if (hub.pillarPage) hubPageSlugs.add(hub.pillarPage.slug);
    for (const spoke of hub.spokes) hubPageSlugs.add(spoke.slug);
  }

  // Pages not in any hub
  const standalonePages = pages.filter((p) => !hubPageSlugs.has(p.slug));

  // Group standalone by collection
  const collections = new Map<string, typeof pages>();
  const uncategorized: typeof pages = [];

  for (const page of standalonePages) {
    if (page.collection) {
      if (!collections.has(page.collection)) {
        collections.set(page.collection, []);
      }
      collections.get(page.collection)!.push(page);
    } else {
      uncategorized.push(page);
    }
  }

  let output = "";

  // Header
  output += `# ${site.name}\n\n`;
  if (site.tagline) output += `> ${site.tagline}\n\n`;
  if (site.description) output += `${site.description}\n\n`;
  output += `## Site Information\n\n`;
  output += `- URL: ${baseUrl}\n`;
  output += `- Sitemap: ${baseUrl}/sitemap.xml\n`;
  output += `- RSS Feed: ${baseUrl}/feed.xml\n`;
  output += `- Total Published Pages: ${pages.length}\n`;
  output += `- Content Hubs: ${hubs.length}\n`;
  output += `\n`;

  // ── CONTENT HUBS ──
  if (hubs.length > 0) {
    output += `## Topic Hubs\n\n`;
    output += `This site organizes content into topic clusters (hubs). Each hub has a pillar page and related spoke pages that provide depth on the topic.\n\n`;

    for (const hub of hubs) {
      output += `### ${hub.name}\n\n`;
      if (hub.description) output += `${hub.description}\n\n`;
      output += `- Hub page: [${hub.name}](${baseUrl}/hub/${hub.slug})\n`;

      if (hub.pillarPage) {
        output += `- Pillar (main guide): [${hub.pillarPage.title}](${baseUrl}/${hub.pillarPage.slug})\n`;
      }

      if (hub.spokes.length > 0) {
        output += `- Related articles (${hub.spokes.length}):\n`;
        for (const spoke of hub.spokes) {
          const desc = spoke.metaDescription || spoke.excerpt || extractText(spoke.content, 150);
          output += `  - [${spoke.title}](${baseUrl}/${spoke.slug})`;
          if (desc) output += `: ${desc}`;
          output += `\n`;
        }
      }
      output += `\n`;
    }
  }

  // ── COLLECTIONS ──
  if (collections.size > 0) {
    for (const [collectionName, collectionPages] of collections) {
      output += `## ${collectionName}\n\n`;
      for (const page of collectionPages) {
        const url = page.slug ? `${baseUrl}/${page.slug}` : baseUrl;
        const desc = page.metaDescription || page.excerpt || extractText(page.content, 200);
        output += `- [${page.title}](${url})`;
        if (desc) output += `: ${desc}`;
        output += `\n`;
      }
      output += `\n`;
    }
  }

  // ── STANDALONE PAGES ──
  if (uncategorized.length > 0) {
    output += `## Pages\n\n`;
    for (const page of uncategorized) {
      const url = page.slug ? `${baseUrl}/${page.slug}` : baseUrl;
      const desc = page.metaDescription || page.excerpt || extractText(page.content, 200);
      output += `- [${page.title}](${url})`;
      if (page.contentType !== "PAGE") output += ` (${page.contentType})`;
      if (desc) output += `: ${desc}`;
      output += `\n`;
    }
    output += `\n`;
  }

  // Contact info
  output += `## Contact\n\n`;
  if (site.socialTwitter) output += `- Twitter: ${site.socialTwitter}\n`;
  if (site.socialLinkedin) output += `- LinkedIn: ${site.socialLinkedin}\n`;
  if (site.socialGithub) output += `- GitHub: ${site.socialGithub}\n`;

  return new NextResponse(output, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=3600",
    },
  });
}
