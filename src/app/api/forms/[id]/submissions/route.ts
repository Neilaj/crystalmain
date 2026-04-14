import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET — list submissions for a form
export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const submissions = await prisma.formSubmission.findMany({
    where: { formId: id },
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  return NextResponse.json(submissions);
}

// PUT — update submission status (mark as read, replied, archived)
export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const { submissionId, status } = body;

  if (!submissionId || !status) {
    return NextResponse.json({ error: "submissionId and status required" }, { status: 400 });
  }

  // Verify submission belongs to this form
  const submission = await prisma.formSubmission.findFirst({
    where: { id: submissionId, formId: id },
  });
  if (!submission) return NextResponse.json({ error: "Submission not found" }, { status: 404 });

  const updated = await prisma.formSubmission.update({
    where: { id: submissionId },
    data: { status },
  });

  return NextResponse.json(updated);
}

// DELETE — permanently delete a submission
export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { submissionId } = await request.json();
  if (!submissionId) return NextResponse.json({ error: "submissionId required" }, { status: 400 });

  const submission = await prisma.formSubmission.findFirst({
    where: { id: submissionId, formId: id },
  });
  if (!submission) return NextResponse.json({ error: "Submission not found" }, { status: 404 });

  await prisma.formSubmission.delete({ where: { id: submissionId } });
  return NextResponse.json({ success: true });
}
