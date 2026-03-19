import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET — public form data by slug (no auth)
export async function GET(_request: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  const form = await prisma.contactForm.findFirst({
    where: { slug, enabled: true },
    select: {
      slug: true,
      name: true,
      description: true,
      fields: true,
      submitLabel: true,
      successMessage: true,
      honeypotEnabled: true,
    },
  });

  if (!form) {
    return NextResponse.json({ error: "Form not found" }, { status: 404 });
  }

  return NextResponse.json(form);
}
