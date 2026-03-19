import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// ─── GET: List import history ─────────────────────────────

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const site = await prisma.site.findUnique({ where: { userId: session.user.id } });
    if (!site) {
      return NextResponse.json({ error: "Site not found" }, { status: 404 });
    }

    const imports = await prisma.importHistory.findMany({
      where: { siteId: site.id },
      orderBy: { createdAt: "desc" },
      include: {
        _count: {
          select: { pages: true },
        },
      },
    });

    return NextResponse.json(imports);
  } catch (error: unknown) {
    console.error("Import history error:", error);
    return NextResponse.json({ error: "Failed to load history" }, { status: 500 });
  }
}
