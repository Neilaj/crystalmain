#!/usr/bin/env python3
"""Generate the Parsley AI Writer Manual PDF — LOCAL ONLY, not for public distribution."""

from reportlab.lib.pagesizes import letter
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.colors import HexColor
from reportlab.lib.units import inch
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, PageBreak,
    Table, TableStyle, HRFlowable
)
from reportlab.lib.enums import TA_CENTER

OUTPUT_PATH = "/Users/neilajodah/Desktop/parsley/docs-internal/ai-writer-manual.pdf"

GREEN = HexColor("#16a34a")
DARK_GREEN = HexColor("#15803d")
DARK = HexColor("#111827")
GRAY = HexColor("#6b7280")
RED = HexColor("#dc2626")

import os
os.makedirs(os.path.dirname(OUTPUT_PATH), exist_ok=True)

def build_pdf():
    doc = SimpleDocTemplate(
        OUTPUT_PATH,
        pagesize=letter,
        topMargin=0.75*inch,
        bottomMargin=0.75*inch,
        leftMargin=0.85*inch,
        rightMargin=0.85*inch,
    )

    styles = getSampleStyleSheet()

    styles.add(ParagraphStyle("DocTitle", parent=styles["Title"], fontSize=26, textColor=DARK, spaceAfter=6, fontName="Helvetica-Bold"))
    styles.add(ParagraphStyle("Subtitle", parent=styles["Normal"], fontSize=12, textColor=GRAY, spaceAfter=24, alignment=TA_CENTER))
    styles.add(ParagraphStyle("H1", parent=styles["Heading1"], fontSize=20, textColor=GREEN, spaceBefore=24, spaceAfter=10, fontName="Helvetica-Bold"))
    styles.add(ParagraphStyle("H2", parent=styles["Heading2"], fontSize=15, textColor=DARK, spaceBefore=18, spaceAfter=8, fontName="Helvetica-Bold"))
    styles.add(ParagraphStyle("H3", parent=styles["Heading3"], fontSize=12, textColor=DARK_GREEN, spaceBefore=14, spaceAfter=6, fontName="Helvetica-Bold"))
    styles.add(ParagraphStyle("Body", parent=styles["Normal"], fontSize=10, textColor=DARK, spaceAfter=8, leading=15))
    styles.add(ParagraphStyle("Blt", parent=styles["Normal"], fontSize=10, textColor=DARK, spaceAfter=4, leading=14, leftIndent=20, bulletIndent=8))
    styles.add(ParagraphStyle("Warn", parent=styles["Normal"], fontSize=10, textColor=RED, spaceAfter=8, leading=14, fontName="Helvetica-Bold"))
    styles.add(ParagraphStyle("Tip", parent=styles["Normal"], fontSize=9, textColor=DARK_GREEN, spaceAfter=8, leading=13, leftIndent=12, fontName="Helvetica-Oblique"))
    styles.add(ParagraphStyle("Ft", parent=styles["Normal"], fontSize=8, textColor=GRAY, alignment=TA_CENTER))

    story = []

    # ─── Title Page ────────────────────────────────────
    story.append(Spacer(1, 1.5*inch))
    story.append(Paragraph("Parsley CMS", styles["DocTitle"]))
    story.append(Paragraph("AI Writer Manual", ParagraphStyle("TitleSub", parent=styles["Title"], fontSize=18, textColor=GREEN, spaceAfter=12, fontName="Helvetica")))
    story.append(Spacer(1, 12))
    story.append(HRFlowable(width="40%", thickness=2, color=GREEN))
    story.append(Spacer(1, 12))
    story.append(Paragraph("How to use the Claude-powered AI Writing Assistant<br/>to create content for your Parsley website.", styles["Subtitle"]))
    story.append(Spacer(1, 1.5*inch))
    story.append(Paragraph("INTERNAL DOCUMENT - DO NOT DISTRIBUTE", styles["Warn"]))
    story.append(Spacer(1, 0.5*inch))
    story.append(Paragraph("Version 1.0 | March 2026", styles["Ft"]))
    story.append(PageBreak())

    # ─── Overview ──────────────────────────────────────
    story.append(Paragraph("What is the AI Writer?", styles["H1"]))
    story.append(Paragraph(
        "The AI Writer is a built-in content assistant powered by Claude (Anthropic's AI). "
        "It appears as a side panel in the Parsley page editor and helps you write, improve, "
        "expand, and optimize page content without leaving the admin.",
        styles["Body"]
    ))
    story.append(Paragraph(
        "The AI Writer outputs clean, human-readable text that goes directly onto your page. "
        "It does NOT output HTML code, technical jargon, or SEO instructions mixed into "
        "your content. Content and SEO suggestions are kept completely separate.",
        styles["Body"]
    ))

    # ─── Getting Started ───────────────────────────────
    story.append(Paragraph("Getting Started", styles["H1"]))

    story.append(Paragraph("Step 1: Add Your API Key", styles["H2"]))
    story.append(Paragraph("The AI Writer requires a Claude API key from Anthropic:", styles["Body"]))
    steps = [
        "Go to console.anthropic.com and create an account",
        "Generate an API key",
        "Add it to your Vercel environment variables as ANTHROPIC_API_KEY",
        "Redeploy your Vercel project so it picks up the new variable",
    ]
    for i, s in enumerate(steps, 1):
        story.append(Paragraph(f"<bullet>{i}.</bullet> {s}", styles["Blt"]))
    story.append(Paragraph("Tip: Each site owner should use their own API key. The key owner pays for usage.", styles["Tip"]))

    story.append(Paragraph("Step 2: Open the AI Writer", styles["H2"]))
    steps = [
        'Go to any page in the admin editor (/admin/pages)',
        'Click the "AI Writer" button in the bottom-right corner',
        "The AI panel opens on the right side of the editor",
    ]
    for i, s in enumerate(steps, 1):
        story.append(Paragraph(f"<bullet>{i}.</bullet> {s}", styles["Blt"]))

    # ─── Quick Action Buttons ──────────────────────────
    story.append(Paragraph("Quick Action Buttons", styles["H1"]))
    story.append(Paragraph("The AI Writer has 8 quick action buttons. Here's what each one does:", styles["Body"]))

    actions = [
        ["Button", "What It Does", "When to Use"],
        ["Write", "Writes new content based on your prompt", "Starting a new page or section"],
        ["Outline", "Creates a structured outline with headings", "Planning a page before writing"],
        ["FAQ", "Generates Q&A pairs about a topic", "Creating FAQ sections"],
        ["Improve", "Rewrites existing content to be clearer", "Polishing draft content"],
        ["Expand", "Adds more detail to existing content", "When content feels thin"],
        ["Shorten", "Makes content more concise", "When content is too long"],
        ["SEO Tips", "Gives meta title, description, and tips", "Optimizing for search engines"],
        ["Hub Ideas", "Suggests related articles for your hub", "Growing a content hub"],
    ]
    t = Table(actions, colWidths=[1.2*inch, 2.5*inch, 2.3*inch])
    t.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, 0), GREEN),
        ("TEXTCOLOR", (0, 0), (-1, 0), HexColor("#ffffff")),
        ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
        ("FONTSIZE", (0, 0), (-1, -1), 9),
        ("GRID", (0, 0), (-1, -1), 0.5, HexColor("#e5e7eb")),
        ("ROWBACKGROUNDS", (0, 1), (-1, -1), [HexColor("#ffffff"), HexColor("#f9fafb")]),
        ("TOPPADDING", (0, 0), (-1, -1), 6),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 6),
        ("LEFTPADDING", (0, 0), (-1, -1), 8),
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
    ]))
    story.append(t)

    story.append(PageBreak())

    # ─── How to Use Each Button ────────────────────────
    story.append(Paragraph("How to Use Each Button", styles["H1"]))

    story.append(Paragraph("Write", styles["H2"]))
    story.append(Paragraph("Type a prompt describing what you want written, then click the Write button or press Enter.", styles["Body"]))
    story.append(Paragraph("Example prompts:", styles["Body"]))
    examples = [
        '"Write an about page for Crystal Studios web design company"',
        '"Write a service description for our mobile app development"',
        '"Write 200 words about why businesses need AI-optimized websites"',
    ]
    for e in examples:
        story.append(Paragraph(f"<bullet>&bull;</bullet> {e}", styles["Blt"]))
    story.append(Paragraph("The AI writes clean text that appears in the chat. Click 'Insert into editor' to add it to your page.", styles["Body"]))

    story.append(Paragraph("Improve", styles["H2"]))
    story.append(Paragraph(
        "Select text in the editor first, then click Improve. The AI rewrites your selected text "
        "to be clearer and more professional while keeping your voice. The improved version appears "
        "in the chat — click 'Insert' to replace your selection.",
        styles["Body"]
    ))

    story.append(Paragraph("Expand", styles["H2"]))
    story.append(Paragraph(
        "Select text that feels too short, then click Expand. The AI adds more detail, examples, "
        "and depth to your content.",
        styles["Body"]
    ))

    story.append(Paragraph("Shorten", styles["H2"]))
    story.append(Paragraph(
        "Select text that's too long, then click Shorten. The AI makes it more concise while "
        "keeping the key points.",
        styles["Body"]
    ))

    story.append(Paragraph("Outline", styles["H2"]))
    story.append(Paragraph(
        "Type a topic, then click Outline. The AI creates a structured outline with headings "
        "and subsections. Great for planning a page before you start writing.",
        styles["Body"]
    ))

    story.append(Paragraph("FAQ", styles["H2"]))
    story.append(Paragraph(
        "Type a topic, then click FAQ. The AI generates 5-8 questions and detailed answers. "
        "This is especially useful for FAQ-type pages and for AEO — AI search engines love "
        "question-and-answer format.",
        styles["Body"]
    ))

    story.append(Paragraph("SEO Tips", styles["H2"]))
    story.append(Paragraph(
        "Click SEO Tips to get optimization suggestions for your current page. This is the ONLY "
        "button that gives you technical SEO advice. The output includes:",
        styles["Body"]
    ))
    seo_items = [
        "<b>Meta Title</b> — Copy this into the 'Meta Title' field in the page sidebar",
        "<b>Meta Description</b> — Copy this into the 'Meta Description' field",
        "<b>Content improvements</b> — Suggestions for what to add or change",
        "<b>Excerpt</b> — Copy this into the 'Excerpt' field",
    ]
    for s in seo_items:
        story.append(Paragraph(f"<bullet>&bull;</bullet> {s}", styles["Blt"]))
    story.append(Paragraph("Important: SEO suggestions go in the sidebar fields, NOT in the page content.", styles["Warn"]))

    story.append(Paragraph("Hub Ideas", styles["H2"]))
    story.append(Paragraph(
        "If your page is assigned to a Content Hub, click Hub Ideas to get article suggestions "
        "that would strengthen that hub. Use these ideas to create new pages.",
        styles["Body"]
    ))

    story.append(PageBreak())

    # ─── Where to Put What ─────────────────────────────
    story.append(Paragraph("Where to Put What", styles["H1"]))
    story.append(Paragraph("This is the most important section. The AI gives you two types of output:", styles["Body"]))

    where_data = [
        ["AI Output", "Where It Goes", "How"],
        ["Page content\n(headings, paragraphs,\nbullet points)", "The main editor area\n(center of the page)", "Click 'Insert into editor'\nor copy-paste"],
        ["Meta Title", "Sidebar > Meta Title field", "Copy-paste from\nSEO Tips output"],
        ["Meta Description", "Sidebar > Meta Description field", "Copy-paste from\nSEO Tips output"],
        ["Excerpt", "Sidebar > Excerpt field", "Copy-paste from\nSEO Tips output"],
        ["Content suggestions", "Your brain\n(decide what to act on)", "Read and decide"],
        ["Hub Ideas", "Create new pages\nfrom the suggestions", "Go to Pages > New"],
    ]
    wt = Table(where_data, colWidths=[2*inch, 2*inch, 2*inch])
    wt.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, 0), GREEN),
        ("TEXTCOLOR", (0, 0), (-1, 0), HexColor("#ffffff")),
        ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
        ("FONTSIZE", (0, 0), (-1, -1), 9),
        ("GRID", (0, 0), (-1, -1), 0.5, HexColor("#e5e7eb")),
        ("ROWBACKGROUNDS", (0, 1), (-1, -1), [HexColor("#ffffff"), HexColor("#f9fafb")]),
        ("TOPPADDING", (0, 0), (-1, -1), 6),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 6),
        ("LEFTPADDING", (0, 0), (-1, -1), 8),
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
    ]))
    story.append(wt)

    story.append(Spacer(1, 16))
    story.append(Paragraph("The Golden Rule", styles["H2"]))
    story.append(Paragraph(
        "If a customer would see it on the website, it goes in the editor. "
        "If it's for search engines or your own reference, it goes in the sidebar fields. "
        "Never mix SEO instructions into your page content.",
        styles["Body"]
    ))

    # ─── Best Practices ───────────────────────────────
    story.append(Paragraph("Best Practices", styles["H1"]))

    practices = [
        "<b>Be specific in your prompts</b> — 'Write about web design' gives generic results. 'Write 200 words about why small businesses in New Jersey need mobile-first websites' gives great results.",
        "<b>Write first, improve second</b> — Get a draft down, then use Improve to polish it.",
        "<b>Always review AI output</b> — AI writes well but you know your business better. Edit the output to match your voice.",
        "<b>Use Outline for long pages</b> — Plan the structure first, then write each section.",
        "<b>Run SEO Tips last</b> — Write your content first, then get SEO suggestions to fill in the sidebar fields.",
        "<b>Don't over-optimize</b> — Write for humans first. AI search engines prefer natural, authoritative content over keyword-stuffed text.",
        "<b>Assign pages to hubs</b> — The AI gives better suggestions when it knows which content hub a page belongs to.",
    ]
    for p in practices:
        story.append(Paragraph(f"<bullet>&bull;</bullet> {p}", styles["Blt"]))

    # ─── Workflow Example ──────────────────────────────
    story.append(Paragraph("Example Workflow: Creating an About Page", styles["H1"]))
    workflow = [
        "Create a new page in /admin/pages, title it 'About Us', set slug to 'about-us'",
        "Open the AI Writer panel",
        "Click Outline, type: 'About page for Crystal Studios web design and software company'",
        "Review the outline, insert it into the editor",
        "For each section, select the heading and click Write to generate content",
        "Review and edit the generated content to match your voice",
        "Use Improve on any sections that feel weak",
        "Click SEO Tips to get meta title and description suggestions",
        "Copy the meta title into the sidebar Meta Title field",
        "Copy the meta description into the sidebar Meta Description field",
        "Set the content type to 'Page' in the sidebar",
        "Click Publish",
    ]
    for i, s in enumerate(workflow, 1):
        story.append(Paragraph(f"<bullet>{i}.</bullet> {s}", styles["Blt"]))

    # ─── Cost ──────────────────────────────────────────
    story.append(Paragraph("API Usage and Cost", styles["H1"]))
    story.append(Paragraph(
        "The AI Writer uses the Claude API which charges per token (roughly per word). "
        "Typical costs:",
        styles["Body"]
    ))
    cost_items = [
        "Writing a 300-word section: ~$0.01-0.02",
        "Improving existing text: ~$0.005-0.01",
        "SEO Tips analysis: ~$0.01",
        "A full page with multiple sections: ~$0.05-0.10",
        "Monthly cost for moderate use: ~$5-15",
    ]
    for c in cost_items:
        story.append(Paragraph(f"<bullet>&bull;</bullet> {c}", styles["Blt"]))
    story.append(Paragraph(
        "Monitor your usage at console.anthropic.com. Set spending limits to avoid surprises.",
        styles["Body"]
    ))

    # ─── Footer ────────────────────────────────────────
    story.append(Spacer(1, 1*inch))
    story.append(HRFlowable(width="100%", thickness=1, color=HexColor("#e5e7eb")))
    story.append(Spacer(1, 8))
    story.append(Paragraph("Parsley CMS - AI Writer Manual (Internal)", styles["Ft"]))
    story.append(Paragraph("DO NOT DISTRIBUTE", styles["Ft"]))

    doc.build(story)
    print(f"PDF generated: {OUTPUT_PATH}")

if __name__ == "__main__":
    build_pdf()
