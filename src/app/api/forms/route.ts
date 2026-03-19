import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET — list all forms
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const site = await prisma.site.findUnique({ where: { userId: session.user.id } });
  if (!site) return NextResponse.json({ error: "No site" }, { status: 404 });

  const forms = await prisma.contactForm.findMany({
    where: { siteId: site.id },
    include: { _count: { select: { submissions: true } } },
    orderBy: { createdAt: "desc" },
  });

  // Get new submission counts
  const formsWithNewCount = await Promise.all(
    forms.map(async (form) => {
      const newCount = await prisma.formSubmission.count({
        where: { formId: form.id, status: "NEW" },
      });
      return { ...form, newSubmissions: newCount };
    })
  );

  return NextResponse.json(formsWithNewCount);
}

// POST — create a form
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const site = await prisma.site.findUnique({ where: { userId: session.user.id } });
    if (!site) return NextResponse.json({ error: "No site found. Please log out and log back in." }, { status: 404 });

    const body = await request.json();
    const { name, slug, description, fields, submitLabel, successMessage, notifyEmail } = body;

    if (!name || !slug || !fields?.length) {
      return NextResponse.json({ error: "Name, slug, and at least one field are required" }, { status: 400 });
    }

    // Check slug uniqueness
    const existing = await prisma.contactForm.findUnique({
      where: { siteId_slug: { siteId: site.id, slug } },
    });
    if (existing) {
      return NextResponse.json({ error: `A form with slug "${slug}" already exists. Try a different slug.` }, { status: 400 });
    }

    const form = await prisma.contactForm.create({
      data: {
        name,
        slug,
        description: description || null,
        fields,
        submitLabel: submitLabel || "Send Message",
        successMessage: successMessage || "Thank you! We'll get back to you soon.",
        notifyEmail: notifyEmail || null,
        siteId: site.id,
      },
    });

    return NextResponse.json(form, { status: 201 });
  } catch (error: unknown) {
    console.error("Form create error:", error);
    const message = error instanceof Error ? error.message : "Failed to create form";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
