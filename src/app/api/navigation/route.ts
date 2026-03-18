import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET /api/navigation
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

  const navItems = await prisma.navigation.findMany({
    where: { siteId: site.id },
    orderBy: { order: "asc" },
  });

  return NextResponse.json(navItems);
}

// POST /api/navigation — create a new nav item
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
  const { label, url, openNew } = body;

  if (!label?.trim() || !url?.trim()) {
    return NextResponse.json({ error: "Label and URL are required" }, { status: 400 });
  }

  // Get max order
  const maxOrder = await prisma.navigation.findFirst({
    where: { siteId: site.id },
    orderBy: { order: "desc" },
    select: { order: true },
  });

  const item = await prisma.navigation.create({
    data: {
      label,
      url,
      openNew: openNew || false,
      order: (maxOrder?.order ?? -1) + 1,
      siteId: site.id,
    },
  });

  return NextResponse.json(item, { status: 201 });
}

// PUT /api/navigation — reorder all items
export async function PUT(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { items } = body as { items: { id: string; order: number }[] };

  if (!items?.length) {
    return NextResponse.json({ error: "Items required" }, { status: 400 });
  }

  // Update all orders in a transaction
  await prisma.$transaction(
    items.map((item) =>
      prisma.navigation.update({
        where: { id: item.id },
        data: { order: item.order },
      })
    )
  );

  return NextResponse.json({ success: true });
}
