import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// PUT /api/navigation/[id] — update a nav item
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { label, url, openNew } = body;

  const item = await prisma.navigation.update({
    where: { id },
    data: {
      ...(label !== undefined && { label }),
      ...(url !== undefined && { url }),
      ...(openNew !== undefined && { openNew }),
    },
  });

  return NextResponse.json(item);
}

// DELETE /api/navigation/[id]
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await prisma.navigation.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
