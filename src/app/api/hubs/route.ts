import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET /api/hubs — list all hubs with spoke counts
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

  const hubs = await prisma.hub.findMany({
    where: { siteId: site.id },
    orderBy: { updatedAt: "desc" },
    include: {
      pillarPage: { select: { id: true, title: true, slug: true } },
      spokes: { select: { id: true, title: true, slug: true, status: true }, orderBy: { sortOrder: "asc" } },
      _count: { select: { spokes: true } },
    },
  });

  return NextResponse.json(hubs);
}

// POST /api/hubs — create a new hub
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
  const { name, slug, description, metaTitle, metaDescription, ogImage, pillarPageId } = body;

  if (!name?.trim()) {
    return NextResponse.json({ error: "Name is required" }, { status: 400 });
  }

  const hubSlug = slug || slugify(name);

  // Check for duplicate slug
  const existing = await prisma.hub.findUnique({
    where: { siteId_slug: { siteId: site.id, slug: hubSlug } },
  });
  if (existing) {
    return NextResponse.json({ error: "A hub with this slug already exists" }, { status: 409 });
  }

  const hub = await prisma.hub.create({
    data: {
      name,
      slug: hubSlug,
      description: description || null,
      metaTitle: metaTitle || null,
      metaDescription: metaDescription || null,
      ogImage: ogImage || null,
      pillarPageId: pillarPageId || null,
      siteId: site.id,
    },
    include: {
      spokes: { select: { id: true, title: true, slug: true } },
      _count: { select: { spokes: true } },
    },
  });

  return NextResponse.json(hub, { status: 201 });
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
