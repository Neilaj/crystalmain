import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET /api/hubs/:id — get single hub with all spokes
export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const hub = await prisma.hub.findUnique({
    where: { id },
    include: {
      pillarPage: { select: { id: true, title: true, slug: true, status: true } },
      spokes: {
        select: { id: true, title: true, slug: true, status: true, contentType: true, excerpt: true, updatedAt: true },
        orderBy: { sortOrder: "asc" },
      },
    },
  });

  if (!hub) {
    return NextResponse.json({ error: "Hub not found" }, { status: 404 });
  }

  return NextResponse.json(hub);
}

// PUT /api/hubs/:id — update hub
export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { name, slug, description, metaTitle, metaDescription, ogImage, pillarPageId } = body;

  const hub = await prisma.hub.update({
    where: { id },
    data: {
      ...(name !== undefined && { name }),
      ...(slug !== undefined && { slug }),
      ...(description !== undefined && { description }),
      ...(metaTitle !== undefined && { metaTitle }),
      ...(metaDescription !== undefined && { metaDescription }),
      ...(ogImage !== undefined && { ogImage }),
      ...(pillarPageId !== undefined && { pillarPageId: pillarPageId || null }),
    },
    include: {
      pillarPage: { select: { id: true, title: true, slug: true } },
      spokes: { select: { id: true, title: true, slug: true, status: true } },
      _count: { select: { spokes: true } },
    },
  });

  return NextResponse.json(hub);
}

// DELETE /api/hubs/:id — delete hub (unlinks spokes, doesn't delete them)
export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Unlink all spoke pages first
  await prisma.page.updateMany({
    where: { hubId: id },
    data: { hubId: null },
  });

  await prisma.hub.delete({ where: { id } });

  return NextResponse.json({ success: true });
}
