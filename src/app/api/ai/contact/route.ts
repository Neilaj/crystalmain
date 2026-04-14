import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const { name, email, phone, message } = await req.json();

    if (!name?.trim() || !email?.trim()) {
      return NextResponse.json({ error: "Name and email are required" }, { status: 400 });
    }

    const notifyEmail = process.env.FORM_NOTIFY_EMAIL || process.env.RESEND_TO_EMAIL;
    if (!notifyEmail) {
      console.warn("No FORM_NOTIFY_EMAIL set — submission not emailed");
      return NextResponse.json({ success: true });
    }

    const html = `
      <div style="font-family:system-ui,-apple-system,sans-serif;max-width:600px;margin:0 auto;">
        <div style="background:#b91c1c;color:white;padding:20px 24px;border-radius:8px 8px 0 0;">
          <h2 style="margin:0;font-size:18px;">⚡ New Lead from Ask Chrissy</h2>
          <p style="margin:4px 0 0;opacity:0.9;font-size:14px;">crystalstudios.net</p>
        </div>
        <div style="border:1px solid #e5e7eb;border-top:none;border-radius:0 0 8px 8px;overflow:hidden;">
          <table style="width:100%;border-collapse:collapse;">
            <tr><td style="padding:10px 16px;font-weight:600;color:#374151;border-bottom:1px solid #f3f4f6;width:120px;">Name</td><td style="padding:10px 16px;color:#111827;border-bottom:1px solid #f3f4f6;">${name}</td></tr>
            <tr><td style="padding:10px 16px;font-weight:600;color:#374151;border-bottom:1px solid #f3f4f6;">Email</td><td style="padding:10px 16px;color:#111827;border-bottom:1px solid #f3f4f6;"><a href="mailto:${email}" style="color:#b91c1c;">${email}</a></td></tr>
            ${phone ? `<tr><td style="padding:10px 16px;font-weight:600;color:#374151;border-bottom:1px solid #f3f4f6;">Phone</td><td style="padding:10px 16px;color:#111827;border-bottom:1px solid #f3f4f6;"><a href="tel:${phone}" style="color:#b91c1c;">${phone}</a></td></tr>` : ""}
            ${message ? `<tr><td style="padding:10px 16px;font-weight:600;color:#374151;border-bottom:1px solid #f3f4f6;">Message</td><td style="padding:10px 16px;color:#111827;border-bottom:1px solid #f3f4f6;">${message}</td></tr>` : ""}
            <tr><td style="padding:10px 16px;font-weight:600;color:#374151;">Source</td><td style="padding:10px 16px;color:#6b7280;">Ask Chrissy Chat Assistant</td></tr>
          </table>
        </div>
        <p style="color:#9ca3af;font-size:12px;margin-top:16px;text-align:center;">
          Submitted ${new Date().toLocaleString("en-US", { dateStyle: "full", timeStyle: "short" })}
        </p>
      </div>
    `;

    if (process.env.RESEND_API_KEY) {
      const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: process.env.RESEND_FROM_EMAIL || "Chrissy at Crystal Studios <onboarding@resend.dev>",
          to: notifyEmail,
          subject: `⚡ New lead from Ask Chrissy — ${name}`,
          html,
        }),
      });

      if (!res.ok) {
        const err = await res.text();
        console.error("Resend error:", err);
      }
    }

    // Also save to DB so it appears in the Forms admin panel
    try {
      const contactForm = await prisma.contactForm.findFirst({
        where: { slug: "contact" },
      });
      if (contactForm) {
        const submissionData: Record<string, string> = {
          name,
          email,
          ...(phone ? { phone } : {}),
          ...(message ? { message } : {}),
          source: "Ask Chrissy Chat",
        };
        await prisma.formSubmission.create({
          data: {
            formId: contactForm.id,
            data: submissionData,
            ipAddress: req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || null,
            userAgent: req.headers.get("user-agent")?.slice(0, 500) || null,
          },
        });
      }
    } catch (dbErr) {
      console.error("Failed to save Chrissy submission to DB:", dbErr);
      // Don't fail — email already sent
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Chrissy contact error:", err);
    return NextResponse.json({ error: "Failed to send" }, { status: 500 });
  }
}
