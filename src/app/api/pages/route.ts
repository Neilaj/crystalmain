import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET /api/pages — list all pages
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = (session.user as { id: string }).id;
  const site = await prisma.site.findUnique({ where: { userId } });
  if (!site) {
    return NextResponse.json({ error: "No site found" }, { status: 404 });
  }

  const pages = await prisma.page.findMany({
    where: { siteId: site.id },
    orderBy: { updatedAt: "desc" },
    select: {
      id: true,
      title: true,
      slug: true,
      status: true,
      contentType: true,
      collection: true,
      updatedAt: true,
      publishedAt: true,
    },
  });

  return NextResponse.json(pages);
}

// POST /api/pages — create a new page
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = (session.user as { id: string }).id;
  const site = await prisma.site.findUnique({ where: { userId } });
  if (!site) {
    return NextResponse.json({ error: "No site found" }, { status: 404 });
  }

  const body = await req.json();
  const { title, slug, content, contentType, collection, status, metaTitle, metaDescription, excerpt, hubId } = body;

  if (!title?.trim()) {
    return NextResponse.json({ error: "Title is required" }, { status: 400 });
  }

  // Check for duplicate slug
  const existing = await prisma.page.findUnique({
    where: { siteId_slug: { siteId: site.id, slug: slug || slugify(title) } },
  });
  if (existing) {
    return NextResponse.json({ error: "A page with this slug already exists" }, { status: 409 });
  }

  const page = await prisma.page.create({
    data: {
      title,
      slug: slug || slugify(title),
      content: content || undefined,
      contentType: contentType || "PAGE",
      collection: collection || null,
      status: status || "DRAFT",
      metaTitle: metaTitle || null,
      metaDescription: metaDescription || null,
      excerpt: excerpt || null,
      hubId: hubId || null,
      publishedAt: status === "PUBLISHED" ? new Date() : null,
      siteId: site.id,
      authorId: userId,
    },
  });

  return NextResponse.json(page, { status: 201 });
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}
