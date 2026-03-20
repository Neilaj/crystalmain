import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { put, list, del } from "@vercel/blob";
import { authOptions } from "@/lib/auth";

// POST — upload a GLB file to Vercel Blob
export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const formData = await request.formData();
  const file = formData.get("file") as File;

  if (!file) {
    return NextResponse.json({ error: "No file provided" }, { status: 400 });
  }

  // Only allow GLB and USDZ files
  const allowedTypes = [".glb", ".gltf", ".usdz"];
  const ext = file.name.toLowerCase().slice(file.name.lastIndexOf("."));
  if (!allowedTypes.includes(ext)) {
    return NextResponse.json(
      { error: "Only GLB, glTF, and USDZ files are allowed" },
      { status: 400 }
    );
  }

  // Max 50MB
  if (file.size > 50 * 1024 * 1024) {
    return NextResponse.json(
      { error: "File too large. Maximum 50MB." },
      { status: 400 }
    );
  }

  try {
    const blob = await put(`models/${file.name}`, file, {
      access: "public",
      addRandomSuffix: false,
    });

    return NextResponse.json({
      url: blob.url,
      pathname: blob.pathname,
      size: file.size,
      name: file.name,
    });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}

// GET — list all uploaded models
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { blobs } = await list({ prefix: "models/" });
    return NextResponse.json(
      blobs.map((b) => ({
        url: b.url,
        pathname: b.pathname,
        size: b.size,
        uploadedAt: b.uploadedAt,
      }))
    );
  } catch (error) {
    console.error("List error:", error);
    return NextResponse.json({ error: "Failed to list models" }, { status: 500 });
  }
}

// DELETE — remove a model
export async function DELETE(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { url } = await request.json();
  if (!url) {
    return NextResponse.json({ error: "URL required" }, { status: 400 });
  }

  try {
    await del(url);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete error:", error);
    return NextResponse.json({ error: "Delete failed" }, { status: 500 });
  }
}
