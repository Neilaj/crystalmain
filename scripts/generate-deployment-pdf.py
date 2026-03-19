#!/usr/bin/env python3
"""Generate the Parsley Deployment Guide PDF."""

from reportlab.lib.pagesizes import letter
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.colors import HexColor
from reportlab.lib.units import inch
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, PageBreak,
    Table, TableStyle, HRFlowable
)
from reportlab.lib.enums import TA_CENTER

OUTPUT = "/Users/neilajodah/Desktop/parsley/public/docs/parsley-deployment-guide.pdf"

GREEN = HexColor("#16a34a")
DARK_GREEN = HexColor("#15803d")
DARK = HexColor("#111827")
GRAY = HexColor("#6b7280")

def build():
    doc = SimpleDocTemplate(OUTPUT, pagesize=letter,
        topMargin=0.75*inch, bottomMargin=0.75*inch,
        leftMargin=0.85*inch, rightMargin=0.85*inch)

    styles = getSampleStyleSheet()
    styles.add(ParagraphStyle("DocTitle", parent=styles["Title"], fontSize=26, textColor=DARK, spaceAfter=6, fontName="Helvetica-Bold"))
    styles.add(ParagraphStyle("Subtitle", parent=styles["Normal"], fontSize=12, textColor=GRAY, spaceAfter=24, alignment=TA_CENTER))
    styles.add(ParagraphStyle("H1", parent=styles["Heading1"], fontSize=20, textColor=GREEN, spaceBefore=24, spaceAfter=10, fontName="Helvetica-Bold"))
    styles.add(ParagraphStyle("H2", parent=styles["Heading2"], fontSize=15, textColor=DARK, spaceBefore=18, spaceAfter=8, fontName="Helvetica-Bold"))
    styles.add(ParagraphStyle("H3", parent=styles["Heading3"], fontSize=12, textColor=DARK_GREEN, spaceBefore=14, spaceAfter=6, fontName="Helvetica-Bold"))
    styles.add(ParagraphStyle("Body", parent=styles["Normal"], fontSize=10, textColor=DARK, spaceAfter=8, leading=15))
    styles.add(ParagraphStyle("BulletP", parent=styles["Normal"], fontSize=10, textColor=DARK, spaceAfter=4, leading=14, leftIndent=20, bulletIndent=8))
    styles.add(ParagraphStyle("CodeP", parent=styles["Normal"], fontSize=9, textColor=HexColor("#1e40af"), spaceAfter=4, leading=13, fontName="Courier", leftIndent=20))
    styles.add(ParagraphStyle("FooterP", parent=styles["Normal"], fontSize=8, textColor=GRAY, alignment=TA_CENTER))
    styles.add(ParagraphStyle("CheckP", parent=styles["Normal"], fontSize=10, textColor=DARK, spaceAfter=4, leading=14, leftIndent=20, bulletIndent=8))

    s = []

    # Title page
    s.append(Spacer(1, 1.5*inch))
    s.append(Paragraph("Parsley CMS", styles["DocTitle"]))
    s.append(Paragraph("Deployment Guide: From Local to Live", ParagraphStyle("TitleSub2", parent=styles["Title"], fontSize=18, textColor=GREEN, spaceAfter=12, fontName="Helvetica")))
    s.append(Spacer(1, 12))
    s.append(HRFlowable(width="40%", thickness=2, color=GREEN))
    s.append(Spacer(1, 12))
    s.append(Paragraph("The app is ready on local. Now we must go live.<br/>Follow these steps for Crystal Studios and all future client sites.", styles["Subtitle"]))
    s.append(Spacer(1, 2*inch))
    s.append(Paragraph("Version 1.0 | March 2026", styles["FooterP"]))
    s.append(Paragraph("https://parsley.dev", styles["FooterP"]))
    s.append(PageBreak())

    # Prerequisites
    s.append(Paragraph("Prerequisites", styles["H1"]))
    s.append(Paragraph("Before you begin, ensure you have:", styles["Body"]))
    for b in [
        "A GitHub account with the Parsley repo pushed (github.com/Neilaj/parsley)",
        "A Vercel account (vercel.com) - free tier works",
        "A Neon account (neon.tech) - free tier works",
        "Your local Parsley app running successfully on localhost",
    ]:
        s.append(Paragraph(f"<bullet>&bull;</bullet> {b}", styles["BulletP"]))

    # Step 1
    s.append(Paragraph("Step 1: Set Up Neon Database", styles["H1"]))
    for i, step in enumerate([
        "Go to <b>neon.tech</b> and sign in",
        'Click <b>"New Project"</b>',
        'Name it (e.g., "parsley-crystalstudios" or "parsley-production")',
        "Select a region close to your users (e.g., US East)",
        'Click <b>"Create Project"</b>',
        "Copy the <b>connection string</b> from the Dashboard",
        '<b>IMPORTANT:</b> Also copy the <b>"Pooled connection"</b> string - Vercel serverless functions need connection pooling',
        "Save both strings - you will need them in Step 3",
    ], 1):
        s.append(Paragraph(f"<bullet>{i}.</bullet> {step}", styles["BulletP"]))
    s.append(Spacer(1, 6))
    s.append(Paragraph("The connection string looks like:", styles["Body"]))
    s.append(Paragraph("postgresql://user:pass@ep-xxx.us-east-2.aws.neon.tech/neondb?sslmode=require", styles["CodeP"]))

    # Step 2
    s.append(Paragraph("Step 2: Push Code to GitHub", styles["H1"]))
    s.append(Paragraph("Make sure .gitignore includes:", styles["Body"]))
    for b in [".env (never commit secrets)", "node_modules/", ".next/", "public/models/*.glb (large 3D files)"]:
        s.append(Paragraph(f"<bullet>&bull;</bullet> {b}", styles["BulletP"]))
    s.append(Spacer(1, 6))
    s.append(Paragraph("Then run:", styles["Body"]))
    s.append(Paragraph('git add -A && git commit -m "Ready for production" && git push origin main', styles["CodeP"]))

    # Step 3
    s.append(Paragraph("Step 3: Deploy to Vercel", styles["H1"]))
    for i, step in enumerate([
        "Go to <b>vercel.com</b> and sign in",
        'Click <b>"Add New"</b> &gt; <b>"Project"</b>',
        "Import your GitHub repository (Neilaj/parsley)",
        "Vercel will auto-detect Next.js - keep the defaults",
        "<b>CRITICAL:</b> Add Environment Variables before deploying",
        'Click <b>"Deploy"</b>',
        "Wait for the build to complete (usually 1-2 minutes)",
    ], 1):
        s.append(Paragraph(f"<bullet>{i}.</bullet> {step}", styles["BulletP"]))

    s.append(Spacer(1, 8))
    s.append(Paragraph("Required Environment Variables:", styles["H3"]))
    env_data = [
        ["Variable", "Value"],
        ["DATABASE_URL", "Your Neon pooled connection string"],
        ["NEXTAUTH_SECRET", "Random string (openssl rand -base64 32)"],
        ["NEXTAUTH_URL", "https://your-domain.vercel.app"],
        ["ANTHROPIC_API_KEY", "(Optional) Your Claude API key for AI Writer"],
    ]
    env_table = Table(env_data, colWidths=[2.2*inch, 3.8*inch])
    env_table.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, 0), GREEN),
        ("TEXTCOLOR", (0, 0), (-1, 0), HexColor("#ffffff")),
        ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
        ("FONTNAME", (0, 1), (0, -1), "Courier"),
        ("FONTSIZE", (0, 0), (-1, -1), 9),
        ("GRID", (0, 0), (-1, -1), 0.5, HexColor("#e5e7eb")),
        ("ROWBACKGROUNDS", (0, 1), (-1, -1), [HexColor("#ffffff"), HexColor("#f9fafb")]),
        ("TOPPADDING", (0, 0), (-1, -1), 6),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 6),
        ("LEFTPADDING", (0, 0), (-1, -1), 8),
    ]))
    s.append(env_table)

    s.append(PageBreak())

    # Step 4
    s.append(Paragraph("Step 4: Run Database Migration", styles["H1"]))
    s.append(Paragraph("After the first deploy, set up the database schema:", styles["Body"]))
    for i, step in enumerate([
        "Install Vercel CLI: <b>npm i -g vercel</b>",
        "Link your project: <b>vercel link</b>",
        "Pull env variables: <b>vercel env pull .env.production</b>",
        'Run migration: <b>DATABASE_URL="your-neon-string" npx prisma db push</b>',
        'Seed the database: <b>DATABASE_URL="your-neon-string" npx tsx prisma/seed.ts</b>',
        "Verify in Neon dashboard that tables are created",
    ], 1):
        s.append(Paragraph(f"<bullet>{i}.</bullet> {step}", styles["BulletP"]))

    # Step 5
    s.append(Paragraph("Step 5: Verify the Deployment", styles["H1"]))
    s.append(Paragraph("Visit your Vercel URL and test these routes:", styles["Body"]))
    routes = [
        ["Route", "Expected Result"],
        ["/", "Homepage loads with all sections"],
        ["/about", "Inner page with header and footer"],
        ["/admin", "Login page (redirect if not authenticated)"],
        ["/admin/pages", "Page list after login"],
        ["/llms.txt", "AI search optimization file"],
        ["/sitemap.xml", "XML sitemap with all published pages"],
        ["/robots.txt", "Crawl permissions for AI bots"],
    ]
    routes_table = Table(routes, colWidths=[2*inch, 4*inch])
    routes_table.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, 0), GREEN),
        ("TEXTCOLOR", (0, 0), (-1, 0), HexColor("#ffffff")),
        ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
        ("FONTNAME", (0, 1), (0, -1), "Courier"),
        ("FONTSIZE", (0, 0), (-1, -1), 9),
        ("GRID", (0, 0), (-1, -1), 0.5, HexColor("#e5e7eb")),
        ("ROWBACKGROUNDS", (0, 1), (-1, -1), [HexColor("#ffffff"), HexColor("#f9fafb")]),
        ("TOPPADDING", (0, 0), (-1, -1), 5),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 5),
        ("LEFTPADDING", (0, 0), (-1, -1), 6),
    ]))
    s.append(routes_table)
    s.append(Spacer(1, 8))
    s.append(Paragraph("<b>IMPORTANT:</b> Log in with the seeded credentials (admin@parsley.dev / password123) and <b>immediately change the password</b> in production.", styles["Body"]))

    # Step 6
    s.append(Paragraph("Step 6: Connect Custom Domain", styles["H1"]))
    for i, step in enumerate([
        "In Vercel, go to project <b>Settings &gt; Domains</b>",
        "Add your domain (e.g., crystalstudios.net)",
        "Vercel will show DNS records to add",
        "Go to your domain registrar (GoDaddy, Namecheap, Cloudflare, etc.)",
        "Add DNS records: CNAME www &gt; cname.vercel-dns.com, A @ &gt; 76.76.21.21",
        "Wait for DNS propagation (5-30 minutes)",
        "Update <b>NEXTAUTH_URL</b> in Vercel env vars to your custom domain",
        "Redeploy (Vercel &gt; Deployments &gt; Redeploy)",
    ], 1):
        s.append(Paragraph(f"<bullet>{i}.</bullet> {step}", styles["BulletP"]))

    s.append(PageBreak())

    # Step 7
    s.append(Paragraph("Step 7: Post-Deployment Checklist", styles["H1"]))
    s.append(Paragraph("Security:", styles["H3"]))
    for b in [
        "Change default admin password",
        "Set a strong NEXTAUTH_SECRET (not the dev one)",
        "Remove ANTHROPIC_API_KEY if not needed (or implement BYOK)",
        "Verify .env is NOT committed to GitHub",
    ]:
        s.append(Paragraph(f"<bullet>[ ]</bullet> {b}", styles["CheckP"]))

    s.append(Paragraph("SEO/AI Verification:", styles["H3"]))
    for b in [
        "Check /llms.txt returns correct content",
        "Check /sitemap.xml lists all published pages",
        "Check /robots.txt allows AI crawlers",
        "Test with Google Rich Results Test",
        "Verify JSON-LD structured data on homepage and inner pages",
        "Submit sitemap to Google Search Console",
    ]:
        s.append(Paragraph(f"<bullet>[ ]</bullet> {b}", styles["CheckP"]))

    s.append(Paragraph("Performance:", styles["H3"]))
    for b in [
        "Run Google PageSpeed Insights - target 90+ score",
        "Verify images load correctly",
        "Test on mobile devices",
    ]:
        s.append(Paragraph(f"<bullet>[ ]</bullet> {b}", styles["CheckP"]))

    # Future sites
    s.append(Paragraph("Setting Up Future Client Sites", styles["H1"]))
    s.append(Paragraph("For each new client site built on Parsley:", styles["Body"]))
    for i, step in enumerate([
        "Fork or clone the Parsley repo",
        "Create a new Neon database",
        "Create a new Vercel project linked to the repo",
        "Add environment variables (DATABASE_URL, NEXTAUTH_SECRET, NEXTAUTH_URL)",
        "Deploy and run prisma db push + seed",
        "Customize: homepage, footer, navigation, pages, hubs, settings",
        "Connect client's domain",
        "Hand over admin credentials",
    ], 1):
        s.append(Paragraph(f"<bullet>{i}.</bullet> {step}", styles["BulletP"]))

    s.append(Spacer(1, 8))
    s.append(Paragraph("Each client gets their own:", styles["Body"]))
    for b in ["GitHub repo (or branch)", "Neon database", "Vercel deployment", "Custom domain"]:
        s.append(Paragraph(f"<bullet>&bull;</bullet> {b}", styles["BulletP"]))

    s.append(PageBreak())

    # Troubleshooting
    s.append(Paragraph("Troubleshooting Common Issues", styles["H1"]))

    issues = [
        ("Build fails: Cannot find module '@prisma/client'", 'Add <b>"postinstall": "prisma generate"</b> to package.json scripts. Vercel needs to run prisma generate after npm install.'),
        ("Database connection errors", "Use the <b>POOLED</b> connection string from Neon (not the direct one). Serverless functions need connection pooling. Check sslmode=require is in the string."),
        ("Images not loading", "Unsplash images may return 404 if URLs change - replace with local images. Local images in /public/ are served automatically by Vercel."),
        ("Authentication issues after deploy", "NEXTAUTH_URL must match your actual domain (including https://). NEXTAUTH_SECRET must be set. Clear browser cookies if switching between local and production."),
        ('Pages show "No site found"', "Run the seed script against the production database. Check DATABASE_URL is correct in Vercel environment variables."),
    ]
    for title, fix in issues:
        s.append(Paragraph(f"<b>{title}</b>", styles["H3"]))
        s.append(Paragraph(fix, styles["Body"]))

    # Cost
    s.append(Paragraph("Cost Breakdown", styles["H1"]))
    cost_data = [
        ["Tier", "Vercel", "Neon", "Domain", "Total"],
        ["Single site", "Free", "Free", "$10-15/yr", "$10-15/yr"],
        ["Agency (multi)", "$20/mo", "$19/mo", "$10-15/yr each", "$39/mo + domains"],
    ]
    cost_table = Table(cost_data, colWidths=[1.3*inch, 1.2*inch, 1.2*inch, 1.3*inch, 1.5*inch])
    cost_table.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, 0), GREEN),
        ("TEXTCOLOR", (0, 0), (-1, 0), HexColor("#ffffff")),
        ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
        ("FONTSIZE", (0, 0), (-1, -1), 9),
        ("GRID", (0, 0), (-1, -1), 0.5, HexColor("#e5e7eb")),
        ("ROWBACKGROUNDS", (0, 1), (-1, -1), [HexColor("#ffffff"), HexColor("#f9fafb")]),
        ("TOPPADDING", (0, 0), (-1, -1), 6),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 6),
        ("LEFTPADDING", (0, 0), (-1, -1), 6),
        ("ALIGN", (1, 1), (-1, -1), "CENTER"),
    ]))
    s.append(cost_table)

    # Footer
    s.append(Spacer(1, 1*inch))
    s.append(HRFlowable(width="100%", thickness=1, color=HexColor("#e5e7eb")))
    s.append(Spacer(1, 8))
    s.append(Paragraph("Parsley CMS - Built for the AI search era.", styles["FooterP"]))
    s.append(Paragraph("https://parsley.dev", styles["FooterP"]))

    doc.build(s)
    print(f"PDF generated: {OUTPUT}")

if __name__ == "__main__":
    build()
