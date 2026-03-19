import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// ─── Execute the actual import ────────────────────────────

interface ImportItem {
  wpId: number;
  title: string;
  slug: string;
  type: string;
  contentType: string;
  status: string;
  hub: string | null;
  date: string;
  selected: boolean;
}

interface WPPost {
  id: number;
  date: string;
  slug: string;
  status: string;
  title: { rendered: string };
  content: { rendered: string };
  excerpt: { rendered: string };
  featured_media: number;
  categories: number[];
  _embedded?: {
    "wp:featuredmedia"?: Array<{
      source_url: string;
      alt_text: string;
    }>;
  };
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { wpUrl, items, importMedia, categoryHubMap, wpUsername, wpAppPassword, stagingMode, sourceName } = body as {
      wpUrl: string;
      items: ImportItem[];
      importMedia: boolean;
      categoryHubMap: Record<number, string>;
      wpUsername?: string;
      wpAppPassword?: string;
      stagingMode?: boolean;
      sourceName?: string;
    };

    const baseUrl = wpUrl.replace(/\/+$/, "");
    const apiUrl = `${baseUrl}/wp-json`;

    // Get headers
    const headers: HeadersInit = {
      "Content-Type": "application/json",
      "User-Agent": "Parsley-CMS-Importer/1.0",
    };
    if (wpUsername && wpAppPassword) {
      const credentials = Buffer.from(`${wpUsername}:${wpAppPassword}`).toString("base64");
      headers["Authorization"] = `Basic ${credentials}`;
    }

    // Get user's site
    const site = await prisma.site.findUnique({ where: { userId: session.user.id } });
    if (!site) {
      return NextResponse.json({ error: "Site not found" }, { status: 404 });
    }

    const selectedItems = items.filter((item) => item.selected);

    // Create ImportHistory record
    const importRecord = await prisma.importHistory.create({
      data: {
        source: "wordpress",
        sourceUrl: wpUrl,
        sourceName: sourceName || wpUrl,
        status: "PARTIAL",
        stagingMode: !!stagingMode,
        totalItems: selectedItems.length,
        siteId: site.id,
      },
    });

    const report = {
      total: selectedItems.length,
      imported: 0,
      skipped: 0,
      errors: [] as Array<{ title: string; error: string }>,
      hubsCreated: [] as string[],
      hubIds: [] as string[],
      mediaImported: 0,
      redirects: [] as Array<{ from: string; to: string }>,
    };

    // ─── Step 1: Create hubs from category mapping ─────

    const hubIdMap = new Map<string, string>();
    const uniqueHubs = new Set<string>();
    for (const item of selectedItems) {
      if (item.hub) uniqueHubs.add(item.hub);
    }

    for (const hubName of uniqueHubs) {
      const hubSlug = hubName.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");

      // Check if hub already exists
      const existing = await prisma.hub.findUnique({
        where: { siteId_slug: { siteId: site.id, slug: hubSlug } },
      });

      if (existing) {
        hubIdMap.set(hubName, existing.id);
      } else {
        const hub = await prisma.hub.create({
          data: {
            name: hubName,
            slug: hubSlug,
            description: `Imported from WordPress category: ${hubName}`,
            siteId: site.id,
          },
        });
        hubIdMap.set(hubName, hub.id);
        report.hubsCreated.push(hubName);
        report.hubIds.push(hub.id);
      }
    }

    // ─── Step 2: Import pages/posts ────────────────────

    for (const item of selectedItems) {
      try {
        // Check if slug already exists
        const existingPage = await prisma.page.findUnique({
          where: { siteId_slug: { siteId: site.id, slug: item.slug } },
        });

        if (existingPage) {
          report.skipped++;
          report.errors.push({
            title: item.title,
            error: `Slug "${item.slug}" already exists — skipped`,
          });
          continue;
        }

        // Fetch full content from WP
        const endpoint = item.type === "post" ? "posts" : "pages";
        const res = await fetch(
          `${apiUrl}/wp/v2/${endpoint}/${item.wpId}?_embed=1`,
          { headers }
        );

        if (!res.ok) {
          report.errors.push({
            title: item.title,
            error: `Failed to fetch from WordPress (${res.status})`,
          });
          continue;
        }

        const wpContent: WPPost = await res.json();

        // Convert WP HTML to Tiptap JSON
        const tiptapContent = htmlToTiptap(wpContent.content.rendered);

        // Get featured image URL
        const featuredImage = wpContent._embedded?.["wp:featuredmedia"]?.[0]?.source_url || null;

        // In staging mode, force everything to DRAFT
        const pageStatus = stagingMode ? "DRAFT" : (item.status as "DRAFT" | "PUBLISHED" | "ARCHIVED");

        // Create the page
        await prisma.page.create({
          data: {
            title: decodeHtmlEntities(wpContent.title.rendered),
            slug: item.slug,
            content: tiptapContent,
            contentType: item.contentType as "PAGE" | "ARTICLE" | "FAQ" | "LANDING" | "SERVICE" | "PRODUCT" | "PORTFOLIO" | "CONTACT",
            status: pageStatus,
            excerpt: stripHtml(wpContent.excerpt.rendered).slice(0, 300) || null,
            ogImage: featuredImage,
            publishedAt: pageStatus === "PUBLISHED" ? new Date(wpContent.date) : null,
            hubId: item.hub ? hubIdMap.get(item.hub) || null : null,
            importBatchId: importRecord.id,
            siteId: site.id,
            authorId: session.user.id,
          },
        });

        // Track redirect
        report.redirects.push({
          from: `/${item.type === "post" ? item.slug : item.slug}`,
          to: `/${item.slug}`,
        });

        report.imported++;
      } catch (error: unknown) {
        const message = error instanceof Error ? error.message : "Unknown error";
        report.errors.push({ title: item.title, error: message });
      }
    }

    // ─── Step 3: Import media (if selected) ────────────

    if (importMedia) {
      try {
        let page = 1;
        let hasMore = true;
        while (hasMore && report.mediaImported < 500) {
          const res = await fetch(
            `${apiUrl}/wp/v2/media?per_page=50&page=${page}`,
            { headers }
          );
          if (!res.ok) break;

          interface WPMediaItem {
            id: number;
            source_url: string;
            alt_text: string;
            mime_type: string;
            title: { rendered: string };
            media_details?: {
              filesize?: number;
            };
          }
          const mediaItems: WPMediaItem[] = await res.json();
          if (mediaItems.length === 0) break;

          for (const media of mediaItems) {
            try {
              // Store reference to WP media (don't download — just link)
              await prisma.media.create({
                data: {
                  url: media.source_url,
                  filename: media.source_url.split("/").pop() || "unknown",
                  alt: media.alt_text || decodeHtmlEntities(media.title.rendered),
                  mimeType: media.mime_type,
                  size: media.media_details?.filesize || 0,
                  siteId: site.id,
                },
              });
              report.mediaImported++;
            } catch {
              // Skip duplicate media
            }
          }

          const totalPages = parseInt(res.headers.get("X-WP-TotalPages") || "1");
          hasMore = page < totalPages;
          page++;
        }
      } catch {
        report.errors.push({ title: "Media Import", error: "Media import partially failed" });
      }
    }

    // Update ImportHistory with final stats
    await prisma.importHistory.update({
      where: { id: importRecord.id },
      data: {
        status: report.errors.length > 0 && report.imported === 0 ? "PARTIAL" : "COMPLETED",
        importedCount: report.imported,
        skippedCount: report.skipped,
        mediaCount: report.mediaImported,
        hubIds: report.hubIds,
        report: report as unknown as import("@prisma/client").Prisma.InputJsonValue,
      },
    });

    return NextResponse.json({ success: true, report, importId: importRecord.id });
  } catch (error: unknown) {
    console.error("Import execution error:", error);
    const message = error instanceof Error ? error.message : "Import failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// ─── HTML to Tiptap JSON converter ────────────────────────

function htmlToTiptap(html: string): object {
  // Convert WordPress HTML blocks to Tiptap JSON structure
  const content: Array<Record<string, unknown>> = [];

  // Clean up WP-specific markup
  let cleaned = html
    .replace(/<!-- wp:.*?-->/g, "")
    .replace(/<!-- \/wp:.*?-->/g, "")
    .replace(/\n{3,}/g, "\n\n")
    .trim();

  // Split into blocks
  const blocks = cleaned.split(/\n\n+/);

  for (const block of blocks) {
    const trimmed = block.trim();
    if (!trimmed) continue;

    // Headings
    const headingMatch = trimmed.match(/^<h([1-6])[^>]*>(.*?)<\/h[1-6]>/i);
    if (headingMatch) {
      content.push({
        type: "heading",
        attrs: { level: parseInt(headingMatch[1]) },
        content: parseInlineContent(headingMatch[2]),
      });
      continue;
    }

    // Images
    const imgMatch = trimmed.match(/<img[^>]*src="([^"]*)"[^>]*(?:alt="([^"]*)")?[^>]*>/i);
    if (imgMatch) {
      content.push({
        type: "image",
        attrs: {
          src: imgMatch[1],
          alt: imgMatch[2] || "",
        },
      });
      continue;
    }

    // Unordered lists
    if (trimmed.startsWith("<ul")) {
      const items = trimmed.match(/<li[^>]*>(.*?)<\/li>/gi) || [];
      content.push({
        type: "bulletList",
        content: items.map((li) => ({
          type: "listItem",
          content: [
            {
              type: "paragraph",
              content: parseInlineContent(li.replace(/<\/?li[^>]*>/gi, "")),
            },
          ],
        })),
      });
      continue;
    }

    // Ordered lists
    if (trimmed.startsWith("<ol")) {
      const items = trimmed.match(/<li[^>]*>(.*?)<\/li>/gi) || [];
      content.push({
        type: "orderedList",
        content: items.map((li) => ({
          type: "listItem",
          content: [
            {
              type: "paragraph",
              content: parseInlineContent(li.replace(/<\/?li[^>]*>/gi, "")),
            },
          ],
        })),
      });
      continue;
    }

    // Blockquotes
    if (trimmed.startsWith("<blockquote")) {
      const inner = trimmed.replace(/<\/?blockquote[^>]*>/gi, "").trim();
      content.push({
        type: "blockquote",
        content: [
          {
            type: "paragraph",
            content: parseInlineContent(stripHtml(inner)),
          },
        ],
      });
      continue;
    }

    // Code blocks
    if (trimmed.startsWith("<pre")) {
      const code = stripHtml(trimmed.replace(/<\/?pre[^>]*>/gi, "").replace(/<\/?code[^>]*>/gi, ""));
      content.push({
        type: "codeBlock",
        content: [{ type: "text", text: code }],
      });
      continue;
    }

    // Horizontal rules
    if (trimmed === "<hr>" || trimmed === "<hr />" || trimmed === "<hr/>") {
      content.push({ type: "horizontalRule" });
      continue;
    }

    // Paragraphs (default)
    const text = stripHtml(trimmed);
    if (text) {
      content.push({
        type: "paragraph",
        content: parseInlineContent(trimmed.replace(/<\/?p[^>]*>/gi, "")),
      });
    }
  }

  return {
    type: "doc",
    content: content.length > 0 ? content : [{ type: "paragraph" }],
  };
}

function parseInlineContent(html: string): Array<Record<string, unknown>> {
  const result: Array<Record<string, unknown>> = [];
  const text = stripHtml(html);
  if (text) {
    const marks: Array<Record<string, unknown>> = [];

    // Check for bold
    if (html.includes("<strong") || html.includes("<b>")) {
      marks.push({ type: "bold" });
    }
    // Check for italic
    if (html.includes("<em") || html.includes("<i>")) {
      marks.push({ type: "italic" });
    }
    // Check for links
    const linkMatch = html.match(/<a[^>]*href="([^"]*)"[^>]*>/);
    if (linkMatch) {
      marks.push({
        type: "link",
        attrs: { href: linkMatch[1], target: "_blank" },
      });
    }

    result.push({
      type: "text",
      text,
      ...(marks.length > 0 ? { marks } : {}),
    });
  }
  return result;
}

function decodeHtmlEntities(text: string): string {
  return text
    .replace(/&#8217;/g, "'")
    .replace(/&#8216;/g, "'")
    .replace(/&#8220;/g, '"')
    .replace(/&#8221;/g, '"')
    .replace(/&#038;/g, "&")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#8211;/g, "–")
    .replace(/&#8212;/g, "—")
    .replace(/&#\d+;/g, "");
}

function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, "").replace(/\s+/g, " ").trim();
}
