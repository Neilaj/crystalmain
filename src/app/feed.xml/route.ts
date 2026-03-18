import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSite } from "@/lib/get-site";
import { extractText } from "@/lib/render-content";

export const dynamic = "force-dynamic";

function escapeXml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export async function GET() {
  const site = await getSite();
  const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3001";

  if (!site) {
    return new NextResponse("Site not configured", { status: 404 });
  }

  const pages = await prisma.page.findMany({
    where: { status: "PUBLISHED" },
    orderBy: { publishedAt: "desc" },
    take: 50,
    select: {
      title: true,
      slug: true,
      metaDescription: true,
      excerpt: true,
      content: true,
      publishedAt: true,
      updatedAt: true,
      author: { select: { name: true } },
    },
  });

  const items = pages
    .map((page) => {
      const url = page.slug ? `${baseUrl}/${page.slug}` : baseUrl;
      const description =
        page.metaDescription || page.excerpt || extractText(page.content, 300);
      const pubDate = (page.publishedAt || page.updatedAt).toUTCString();

      return `    <item>
      <title>${escapeXml(page.title)}</title>
      <link>${escapeXml(url)}</link>
      <guid isPermaLink="true">${escapeXml(url)}</guid>
      <description>${escapeXml(description)}</description>
      <pubDate>${pubDate}</pubDate>
      <author>${escapeXml(page.author.name)}</author>
    </item>`;
    })
    .join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escapeXml(site.name)}</title>
    <link>${escapeXml(baseUrl)}</link>
    <description>${escapeXml(site.description || site.tagline || "")}</description>
    <language>en</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <atom:link href="${escapeXml(baseUrl)}/feed.xml" rel="self" type="application/rss+xml"/>
    <generator>Parsley CMS</generator>
${items}
  </channel>
</rss>`;

  return new NextResponse(xml, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=3600",
    },
  });
}
