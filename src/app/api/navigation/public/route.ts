import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/navigation/public?location=HEADER
// Public endpoint — no auth required. Used by homepage and inner page layouts.
export async function GET(req: NextRequest) {
  const location = req.nextUrl.searchParams.get("location"); // HEADER, FOOTER, or BOTH

  // Get the first site (single-tenant for now)
  const site = await prisma.site.findFirst();
  if (!site) {
    return NextResponse.json([]);
  }

  const allNav = await prisma.navigation.findMany({
    where: { siteId: site.id },
    orderBy: { order: "asc" },
    select: {
      id: true,
      label: true,
      url: true,
      openNew: true,
      location: true,
    },
  });

  let filtered = allNav;
  if (location === "HEADER") {
    filtered = allNav.filter((n) => n.location === "HEADER" || n.location === "BOTH");
  } else if (location === "FOOTER") {
    filtered = allNav.filter((n) => n.location === "FOOTER" || n.location === "BOTH");
  }

  return NextResponse.json(filtered);
}
