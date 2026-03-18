import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

// GET /api/media — list all media
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

  const media = await prisma.media.findMany({
    where: { siteId: site.id },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(media);
}

// POST /api/media — upload a file
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

  const formData = await req.formData();
  const file = formData.get("file") as File | null;

  if (!file) {
    return NextResponse.json({ error: "No file provided" }, { status: 400 });
  }

  // Validate file type
  const allowedTypes = ["image/jpeg", "image/png", "image/gif", "image/webp", "image/svg+xml"];
  if (!allowedTypes.includes(file.type)) {
    return NextResponse.json({ error: "File type not allowed. Use JPEG, PNG, GIF, WebP, or SVG." }, { status: 400 });
  }

  // Max 10MB
  if (file.size > 10 * 1024 * 1024) {
    return NextResponse.json({ error: "File too large. Maximum 10MB." }, { status: 400 });
  }

  // Generate unique filename
  const ext = path.extname(file.name) || ".jpg";
  const basename = path.basename(file.name, ext).replace(/[^a-zA-Z0-9-_]/g, "-");
  const uniqueName = `${basename}-${Date.now()}${ext}`;

  // Save to public/uploads/
  const uploadDir = path.join(process.cwd(), "public", "uploads");
  await mkdir(uploadDir, { recursive: true });

  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);
  await writeFile(path.join(uploadDir, uniqueName), buffer);

  const url = `/uploads/${uniqueName}`;

  // Save to database
  const media = await prisma.media.create({
    data: {
      url,
      filename: file.name,
      alt: "",
      mimeType: file.type,
      size: file.size,
      siteId: site.id,
    },
  });

  return NextResponse.json(media, { status: 201 });
}
