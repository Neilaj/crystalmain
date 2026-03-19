import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// POST — public form submission (no auth required)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { formSlug, data, _honeypot } = body;

    if (!formSlug || !data) {
      return NextResponse.json({ error: "Invalid submission" }, { status: 400 });
    }

    // Honeypot check — if this hidden field has a value, it's a bot
    if (_honeypot) {
      // Pretend success but don't save
      return NextResponse.json({ success: true });
    }

    // Find the form
    const form = await prisma.contactForm.findFirst({
      where: { slug: formSlug, enabled: true },
    });

    if (!form) {
      return NextResponse.json({ error: "Form not found" }, { status: 404 });
    }

    // Validate required fields
    const fields = form.fields as Array<{ name: string; label: string; required?: boolean; type: string }>;
    for (const field of fields) {
      if (field.required && (!data[field.name] || data[field.name].toString().trim() === "")) {
        return NextResponse.json(
          { error: `${field.label} is required` },
          { status: 400 }
        );
      }
    }

    // Basic email validation
    const emailField = fields.find((f) => f.type === "email");
    if (emailField && data[emailField.name]) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(data[emailField.name])) {
        return NextResponse.json({ error: "Invalid email address" }, { status: 400 });
      }
    }

    // Sanitize data — only keep fields defined in the form
    const allowedFields = fields.map((f) => f.name);
    const sanitizedData: Record<string, string> = {};
    for (const key of allowedFields) {
      if (data[key] !== undefined) {
        // Strip HTML tags
        sanitizedData[key] = String(data[key]).replace(/<[^>]*>/g, "").slice(0, 5000);
      }
    }

    // Save submission
    const submission = await prisma.formSubmission.create({
      data: {
        data: sanitizedData,
        ipAddress: request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || null,
        userAgent: request.headers.get("user-agent")?.slice(0, 500) || null,
        referrer: request.headers.get("referer")?.slice(0, 500) || null,
        formId: form.id,
      },
    });

    // TODO: Send email notification if form.notifyEmail is set
    // This would use Resend or similar

    return NextResponse.json({
      success: true,
      message: form.successMessage,
      id: submission.id,
    });
  } catch (error) {
    console.error("Form submission error:", error);
    return NextResponse.json({ error: "Submission failed" }, { status: 500 });
  }
}
