import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// ─── POST: Bulk publish staged (draft) imports ────────────

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { importId } = await request.json();
    if (!importId) {
      return NextResponse.json({ error: "Import ID is required" }, { status: 400 });
    }

    const site = await prisma.site.findUnique({ where: { userId: session.user.id } });
    if (!site) {
      return NextResponse.json({ error: "Site not found" }, { status: 404 });
    }

    // Get the import record
    const importRecord = await prisma.importHistory.findUnique({
      where: { id: importId },
    });

    if (!importRecord || importRecord.siteId !== site.id) {
      return NextResponse.json({ error: "Import not found" }, { status: 404 });
    }

    if (!importRecord.stagingMode) {
      return NextResponse.json({ error: "This import was not in staging mode" }, { status: 400 });
    }

    // Publish all draft pages from this import
    const result = await prisma.page.updateMany({
      where: {
        importBatchId: importId,
        status: "DRAFT",
      },
      data: {
        status: "PUBLISHED",
        publishedAt: new Date(),
      },
    });

    // Update import record
    await prisma.importHistory.update({
      where: { id: importId },
      data: { stagingMode: false },
    });

    return NextResponse.json({
      success: true,
      publishedCount: result.count,
    });
  } catch (error: unknown) {
    console.error("Publish error:", error);
    const message = error instanceof Error ? error.message : "Publish failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
