import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// In-memory rate limiter (resets on server restart — fine for Vercel serverless)
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT_MAX = 3; // max submissions per window
const RATE_LIMIT_WINDOW = 60 * 60 * 1000; // 1 hour in ms
const MIN_SUBMIT_TIME = 3000; // 3 seconds minimum time to fill form

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);

  if (!entry || now > entry.resetTime) {
    rateLimitMap.set(ip, { count: 1, resetTime: now + RATE_LIMIT_WINDOW });
    return false;
  }

  entry.count++;
  return entry.count > RATE_LIMIT_MAX;
}

// POST — public form submission (no auth required)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { formSlug, data, _honeypot, _loadedAt } = body;

    if (!formSlug || !data) {
      return NextResponse.json({ error: "Invalid submission" }, { status: 400 });
    }

    // Honeypot check — if this hidden field has a value, it's a bot
    if (_honeypot) {
      // Pretend success but don't save
      return NextResponse.json({ success: true });
    }

    // Time-based check — if submitted in under 3 seconds, likely a bot
    if (_loadedAt) {
      const elapsed = Date.now() - Number(_loadedAt);
      if (elapsed < MIN_SUBMIT_TIME) {
        // Pretend success but don't save
        return NextResponse.json({ success: true });
      }
    }

    // Rate limiting by IP
    const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      request.headers.get("x-real-ip") ||
      "unknown";

    if (isRateLimited(ip)) {
      return NextResponse.json(
        { error: "Too many submissions. Please try again later." },
        { status: 429 }
      );
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
        ipAddress: ip !== "unknown" ? ip : null,
        userAgent: request.headers.get("user-agent")?.slice(0, 500) || null,
        referrer: request.headers.get("referer")?.slice(0, 500) || null,
        formId: form.id,
      },
    });

    // Send email notification
    const notifyEmail = form.notifyEmail || process.env.FORM_NOTIFY_EMAIL;
    if (notifyEmail) {
      try {
        await sendEmailNotification(notifyEmail, form.name, sanitizedData, fields);
      } catch (emailErr) {
        console.error("Failed to send email notification:", emailErr);
        // Don't fail the submission just because email failed
      }
    }

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

// Send email via SMTP (Nodemailer) or Resend
async function sendEmailNotification(
  to: string,
  formName: string,
  data: Record<string, string>,
  fields: Array<{ name: string; label: string; type: string }>
) {
  // Build email body
  const fieldRows = fields
    .filter((f) => data[f.name])
    .map((f) => `<tr><td style="padding:8px 12px;font-weight:600;color:#374151;border-bottom:1px solid #e5e7eb;">${f.label}</td><td style="padding:8px 12px;color:#1f2937;border-bottom:1px solid #e5e7eb;">${data[f.name]}</td></tr>`)
    .join("");

  const html = `
    <div style="font-family:system-ui,-apple-system,sans-serif;max-width:600px;margin:0 auto;">
      <div style="background:#059669;color:white;padding:20px 24px;border-radius:8px 8px 0 0;">
        <h2 style="margin:0;font-size:18px;">New ${formName} Submission</h2>
        <p style="margin:4px 0 0;opacity:0.9;font-size:14px;">From your Parsley website</p>
      </div>
      <div style="border:1px solid #e5e7eb;border-top:none;border-radius:0 0 8px 8px;overflow:hidden;">
        <table style="width:100%;border-collapse:collapse;">
          ${fieldRows}
        </table>
      </div>
      <p style="color:#9ca3af;font-size:12px;margin-top:16px;text-align:center;">
        Submitted on ${new Date().toLocaleString("en-US", { dateStyle: "full", timeStyle: "short" })}
      </p>
    </div>
  `;

  const subject = `New ${formName} submission — Crystal Studios`;

  // Use Resend if API key is available
  if (process.env.RESEND_API_KEY) {
    await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: process.env.RESEND_FROM_EMAIL || "Parsley <onboarding@resend.dev>",
        to,
        subject,
        html,
      }),
    });
    return;
  }

  // Fallback: Use Nodemailer with SMTP if configured
  if (process.env.SMTP_HOST) {
    const nodemailer = await import("nodemailer");
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT) || 587,
      secure: process.env.SMTP_SECURE === "true",
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    await transporter.sendMail({
      from: process.env.SMTP_FROM || process.env.SMTP_USER,
      to,
      subject,
      html,
    });
    return;
  }

  console.warn("No email service configured. Set RESEND_API_KEY or SMTP_HOST.");
}
