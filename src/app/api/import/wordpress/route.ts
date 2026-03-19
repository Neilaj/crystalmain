import { NextRequest, NextResponse } from "next/server";

// ─── Types for WordPress REST API responses ───────────────

interface WPPost {
  id: number;
  date: string;
  modified: string;
  slug: string;
  status: string;
  type: string;
  title: { rendered: string };
  content: { rendered: string };
  excerpt: { rendered: string };
  featured_media: number;
  categories: number[];
  tags: number[];
  _embedded?: {
    "wp:featuredmedia"?: Array<{
      source_url: string;
      alt_text: string;
    }>;
    author?: Array<{
      name: string;
    }>;
  };
}

interface WPCategory {
  id: number;
  name: string;
  slug: string;
  description: string;
  count: number;
  parent: number;
}

interface WPTag {
  id: number;
  name: string;
  slug: string;
  count: number;
}

interface WPMedia {
  id: number;
  source_url: string;
  alt_text: string;
  mime_type: string;
  title: { rendered: string };
  media_details?: {
    file: string;
    sizes?: Record<string, { source_url: string }>;
  };
}

interface WPMenu {
  id: number;
  name: string;
  slug: string;
  items?: WPMenuItem[];
}

interface WPMenuItem {
  id: number;
  title: string;
  url: string;
  order: number;
}

interface WPSiteInfo {
  name: string;
  description: string;
  url: string;
  namespaces: string[];
}

// ─── Step 1: Connect & scan a WordPress site ──────────────

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, wpUrl, wpUsername, wpAppPassword } = body;

    if (!wpUrl) {
      return NextResponse.json({ error: "WordPress URL is required" }, { status: 400 });
    }

    // Normalize URL
    const baseUrl = wpUrl.replace(/\/+$/, "");
    const apiUrl = `${baseUrl}/wp-json`;

    switch (action) {
      case "scan":
        return await scanWordPressSite(apiUrl, baseUrl, wpUsername, wpAppPassword);
      case "preview":
        return await previewContent(apiUrl, body, wpUsername, wpAppPassword);
      default:
        return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }
  } catch (error: unknown) {
    console.error("WordPress import error:", error);
    const message = error instanceof Error ? error.message : "Import failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// Build auth headers if credentials provided
function getHeaders(username?: string, appPassword?: string): HeadersInit {
  const headers: HeadersInit = {
    "Content-Type": "application/json",
    "User-Agent": "Parsley-CMS-Importer/1.0",
  };
  if (username && appPassword) {
    const credentials = Buffer.from(`${username}:${appPassword}`).toString("base64");
    headers["Authorization"] = `Basic ${credentials}`;
  }
  return headers;
}

async function scanWordPressSite(apiUrl: string, baseUrl: string, username?: string, appPassword?: string) {
  const headers = getHeaders(username, appPassword);

  // 1. Check if it's a WordPress site
  let siteInfo: WPSiteInfo;
  try {
    const res = await fetch(apiUrl, { headers });
    if (!res.ok) throw new Error(`Not a WordPress site or API disabled (${res.status})`);
    siteInfo = await res.json();
    if (!siteInfo.namespaces?.includes("wp/v2")) {
      throw new Error("WP REST API v2 not found");
    }
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Connection failed";
    return NextResponse.json(
      { error: `Could not connect to WordPress: ${message}` },
      { status: 400 }
    );
  }

  // 2. Count posts
  const postsRes = await fetch(`${apiUrl}/wp/v2/posts?per_page=1`, { headers });
  const totalPosts = parseInt(postsRes.headers.get("X-WP-Total") || "0");

  // 3. Count pages
  const pagesRes = await fetch(`${apiUrl}/wp/v2/pages?per_page=1`, { headers });
  const totalPages = parseInt(pagesRes.headers.get("X-WP-Total") || "0");

  // 4. Get categories
  const categoriesRes = await fetch(`${apiUrl}/wp/v2/categories?per_page=100`, { headers });
  const categories: WPCategory[] = categoriesRes.ok ? await categoriesRes.json() : [];

  // 5. Get tags
  const tagsRes = await fetch(`${apiUrl}/wp/v2/tags?per_page=100`, { headers });
  const tags: WPTag[] = tagsRes.ok ? await tagsRes.json() : [];

  // 6. Count media
  const mediaRes = await fetch(`${apiUrl}/wp/v2/media?per_page=1`, { headers });
  const totalMedia = parseInt(mediaRes.headers.get("X-WP-Total") || "0");

  // 7. Try to get menus (requires menu endpoint or theme support)
  let menus: WPMenu[] = [];
  try {
    const menusRes = await fetch(`${apiUrl}/wp/v2/menus?per_page=100`, { headers });
    if (menusRes.ok) menus = await menusRes.json();
  } catch {
    // Menus API not available — that's fine
  }

  return NextResponse.json({
    connected: true,
    site: {
      name: siteInfo.name,
      description: siteInfo.description,
      url: baseUrl,
    },
    content: {
      posts: totalPosts,
      pages: totalPages,
      media: totalMedia,
      categories: categories.filter((c) => c.slug !== "uncategorized"),
      tags: tags,
      menus: menus,
    },
    suggestedHubs: categories
      .filter((c) => c.slug !== "uncategorized" && c.count > 0)
      .map((c) => ({
        name: c.name,
        slug: c.slug,
        description: c.description,
        pageCount: c.count,
        wpCategoryId: c.id,
      })),
  });
}

async function previewContent(
  apiUrl: string,
  body: { wpUrl: string; importPosts: boolean; importPages: boolean; importMedia: boolean; categoryHubMap?: Record<number, string> },
  username?: string,
  appPassword?: string
) {
  const headers = getHeaders(username, appPassword);
  const preview: {
    pages: Array<{
      wpId: number;
      title: string;
      slug: string;
      type: string;
      contentType: string;
      status: string;
      hub: string | null;
      date: string;
      excerpt: string;
      hasImage: boolean;
    }>;
    media: number;
    hubs: Array<{ name: string; slug: string; pageCount: number }>;
  } = {
    pages: [],
    media: 0,
    hubs: [],
  };

  // Fetch posts with embedded data
  if (body.importPosts) {
    let page = 1;
    let hasMore = true;
    while (hasMore) {
      const res = await fetch(
        `${apiUrl}/wp/v2/posts?per_page=50&page=${page}&_embed=1&status=publish,draft`,
        { headers }
      );
      if (!res.ok) break;
      const posts: WPPost[] = await res.json();
      if (posts.length === 0) break;

      for (const post of posts) {
        const categoryIds = post.categories || [];
        let hubName: string | null = null;

        // Map WP category to hub
        if (body.categoryHubMap) {
          for (const catId of categoryIds) {
            if (body.categoryHubMap[catId]) {
              hubName = body.categoryHubMap[catId];
              break;
            }
          }
        }

        preview.pages.push({
          wpId: post.id,
          title: decodeHtmlEntities(post.title.rendered),
          slug: post.slug,
          type: "post",
          contentType: "ARTICLE",
          status: post.status === "publish" ? "PUBLISHED" : "DRAFT",
          hub: hubName,
          date: post.date,
          excerpt: stripHtml(post.excerpt.rendered).slice(0, 150),
          hasImage: !!post._embedded?.["wp:featuredmedia"]?.[0],
        });
      }

      const totalPages = parseInt(res.headers.get("X-WP-TotalPages") || "1");
      hasMore = page < totalPages;
      page++;
    }
  }

  // Fetch WP pages
  if (body.importPages) {
    let page = 1;
    let hasMore = true;
    while (hasMore) {
      const res = await fetch(
        `${apiUrl}/wp/v2/pages?per_page=50&page=${page}&_embed=1&status=publish,draft`,
        { headers }
      );
      if (!res.ok) break;
      const wpPages: WPPost[] = await res.json();
      if (wpPages.length === 0) break;

      for (const wpPage of wpPages) {
        preview.pages.push({
          wpId: wpPage.id,
          title: decodeHtmlEntities(wpPage.title.rendered),
          slug: wpPage.slug,
          type: "page",
          contentType: guessContentType(wpPage.slug, wpPage.title.rendered),
          status: wpPage.status === "publish" ? "PUBLISHED" : "DRAFT",
          hub: null,
          date: wpPage.date,
          excerpt: stripHtml(wpPage.excerpt.rendered).slice(0, 150),
          hasImage: !!wpPage._embedded?.["wp:featuredmedia"]?.[0],
        });
      }

      const totalPages = parseInt(res.headers.get("X-WP-TotalPages") || "1");
      hasMore = page < totalPages;
      page++;
    }
  }

  // Media count
  if (body.importMedia) {
    const mediaRes = await fetch(`${apiUrl}/wp/v2/media?per_page=1`, { headers });
    preview.media = parseInt(mediaRes.headers.get("X-WP-Total") || "0");
  }

  // Build hub summary
  const hubMap = new Map<string, number>();
  for (const p of preview.pages) {
    if (p.hub) {
      hubMap.set(p.hub, (hubMap.get(p.hub) || 0) + 1);
    }
  }
  preview.hubs = Array.from(hubMap.entries()).map(([name, count]) => ({
    name,
    slug: name.toLowerCase().replace(/\s+/g, "-"),
    pageCount: count,
  }));

  return NextResponse.json(preview);
}

// ─── Helpers ──────────────────────────────────────────────

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

function guessContentType(slug: string, title: string): string {
  const lower = `${slug} ${title}`.toLowerCase();
  if (lower.includes("about") || lower.includes("story")) return "PAGE";
  if (lower.includes("contact")) return "CONTACT";
  if (lower.includes("service") || lower.includes("what-we-do")) return "SERVICE";
  if (lower.includes("faq") || lower.includes("question")) return "FAQ";
  if (lower.includes("portfolio") || lower.includes("work") || lower.includes("project")) return "PORTFOLIO";
  if (lower.includes("product") || lower.includes("shop")) return "PRODUCT";
  if (lower.includes("home") || lower.includes("landing") || slug === "" || slug === "home") return "LANDING";
  return "PAGE";
}
