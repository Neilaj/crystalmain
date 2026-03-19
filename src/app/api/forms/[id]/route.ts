import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET — get a single form
export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const form = await prisma.contactForm.findUnique({
    where: { id },
    include: { _count: { select: { submissions: true } } },
  });
  if (!form) return NextResponse.json({ error: "Form not found" }, { status: 404 });

  return NextResponse.json(form);
}

// PUT — update a form
export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const { name, slug, description, fields, submitLabel, successMessage, notifyEmail, enabled } = body;

  const form = await prisma.contactForm.update({
    where: { id },
    data: {
      ...(name !== undefined && { name }),
      ...(slug !== undefined && { slug }),
      ...(description !== undefined && { description }),
      ...(fields !== undefined && { fields }),
      ...(submitLabel !== undefined && { submitLabel }),
      ...(successMessage !== undefined && { successMessage }),
      ...(notifyEmail !== undefined && { notifyEmail }),
      ...(enabled !== undefined && { enabled }),
    },
  });

  return NextResponse.json(form);
}

// DELETE — delete a form
export async function DELETE(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await prisma.contactForm.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
