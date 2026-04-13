import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const userId = (session.user as { id: string }).id;
  const site = await prisma.site.findUnique({ where: { userId } });
  if (!site) return NextResponse.json({ error: "No site found" }, { status: 404 });

  return NextResponse.json(site.homepageContent ?? null);
}

export async function PUT(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const userId = (session.user as { id: string }).id;
  const site = await prisma.site.findUnique({ where: { userId } });
  if (!site) return NextResponse.json({ error: "No site found" }, { status: 404 });

  const body = await req.json();
  const updated = await prisma.site.update({
    where: { id: site.id },
    data: { homepageContent: body },
  });

  return NextResponse.json(updated.homepageContent);
}
