import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// ─── POST: Rollback an import ─────────────────────────────

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
      include: { pages: { select: { id: true, title: true } } },
    });

    if (!importRecord || importRecord.siteId !== site.id) {
      return NextResponse.json({ error: "Import not found" }, { status: 404 });
    }

    if (importRecord.status === "ROLLED_BACK") {
      return NextResponse.json({ error: "This import has already been rolled back" }, { status: 400 });
    }

    const rollbackReport = {
      pagesDeleted: 0,
      hubsDeleted: 0,
      errors: [] as string[],
    };

    // 1. Delete all pages created by this import
    try {
      const result = await prisma.page.deleteMany({
        where: { importBatchId: importId },
      });
      rollbackReport.pagesDeleted = result.count;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Unknown error";
      rollbackReport.errors.push(`Failed to delete pages: ${msg}`);
    }

    // 2. Delete hubs created by this import (if they have no other spokes)
    if (importRecord.hubIds && importRecord.hubIds.length > 0) {
      for (const hubId of importRecord.hubIds) {
        try {
          // Check if hub has spokes from other imports
          const spokeCount = await prisma.page.count({
            where: {
              hubId: hubId,
              importBatchId: { not: importId },
            },
          });

          if (spokeCount === 0) {
            await prisma.hub.delete({ where: { id: hubId } });
            rollbackReport.hubsDeleted++;
          }
        } catch {
          // Hub may already be deleted or have dependencies
        }
      }
    }

    // 3. Mark import as rolled back
    await prisma.importHistory.update({
      where: { id: importId },
      data: { status: "ROLLED_BACK" },
    });

    return NextResponse.json({
      success: true,
      report: rollbackReport,
    });
  } catch (error: unknown) {
    console.error("Rollback error:", error);
    const message = error instanceof Error ? error.message : "Rollback failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
