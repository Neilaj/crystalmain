import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET /api/pages/[id] — get a single page
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const page = await prisma.page.findUnique({
    where: { id },
    include: { hub: { select: { id: true, name: true, slug: true } } },
  });
  if (!page) {
    return NextResponse.json({ error: "Page not found" }, { status: 404 });
  }

  return NextResponse.json(page);
}

// PUT /api/pages/[id] — update a page
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const existing = await prisma.page.findUnique({ where: { id } });
  if (!existing) {
    return NextResponse.json({ error: "Page not found" }, { status: 404 });
  }

  const body = await req.json();
  const { title, slug, content, contentType, collection, status, metaTitle, metaDescription, excerpt, hubId } = body;

  // Check slug uniqueness if changed
  if (slug && slug !== existing.slug) {
    const duplicate = await prisma.page.findUnique({
      where: { siteId_slug: { siteId: existing.siteId, slug } },
    });
    if (duplicate && duplicate.id !== id) {
      return NextResponse.json({ error: "A page with this slug already exists" }, { status: 409 });
    }
  }

  const page = await prisma.page.update({
    where: { id },
    data: {
      title,
      slug,
      content: content || undefined,
      contentType: contentType || existing.contentType,
      collection: collection !== undefined ? collection : existing.collection,
      status: status || existing.status,
      metaTitle: metaTitle !== undefined ? metaTitle : existing.metaTitle,
      metaDescription: metaDescription !== undefined ? metaDescription : existing.metaDescription,
      excerpt: excerpt !== undefined ? excerpt : existing.excerpt,
      hubId: hubId !== undefined ? (hubId || null) : existing.hubId,
      publishedAt:
        status === "PUBLISHED" && !existing.publishedAt
          ? new Date()
          : existing.publishedAt,
    },
  });

  return NextResponse.json(page);
}

// DELETE /api/pages/[id] — delete a page
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const existing = await prisma.page.findUnique({ where: { id } });
  if (!existing) {
    return NextResponse.json({ error: "Page not found" }, { status: 404 });
  }

  await prisma.page.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
