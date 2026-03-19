#!/usr/bin/env python3
"""Generate the Parsley CMS Features & Comparison PDF"""

from reportlab.lib.pagesizes import letter
from reportlab.lib.units import inch
from reportlab.lib.colors import HexColor
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib.enums import TA_LEFT, TA_CENTER
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle,
    PageBreak, HRFlowable, KeepTogether
)

# Colors
GREEN = HexColor("#16a34a")
DARK_GREEN = HexColor("#15803d")
DARK = HexColor("#111827")
GRAY = HexColor("#6b7280")
LIGHT_GRAY = HexColor("#f3f4f6")
WHITE = HexColor("#ffffff")
VIOLET = HexColor("#7c3aed")
RED = HexColor("#dc2626")
AMBER = HexColor("#d97706")
BLUE = HexColor("#2563eb")

OUTPUT = "/Users/neilajodah/Desktop/parsley/public/docs/parsley-features-and-comparison.pdf"

doc = SimpleDocTemplate(
    OUTPUT,
    pagesize=letter,
    leftMargin=0.7*inch,
    rightMargin=0.7*inch,
    topMargin=0.7*inch,
    bottomMargin=0.7*inch,
)

# Styles
s = {
    "cover_title": ParagraphStyle("ct", fontSize=38, leading=44, textColor=DARK, fontName="Helvetica-Bold", alignment=TA_CENTER),
    "cover_sub": ParagraphStyle("cs", fontSize=18, leading=24, textColor=GREEN, fontName="Helvetica", alignment=TA_CENTER),
    "cover_desc": ParagraphStyle("cd", fontSize=12, leading=18, textColor=GRAY, fontName="Helvetica", alignment=TA_CENTER),
    "h1": ParagraphStyle("h1", fontSize=24, leading=30, textColor=DARK, fontName="Helvetica-Bold", spaceBefore=20, spaceAfter=10),
    "h2": ParagraphStyle("h2", fontSize=16, leading=22, textColor=DARK_GREEN, fontName="Helvetica-Bold", spaceBefore=16, spaceAfter=6),
    "h3": ParagraphStyle("h3", fontSize=13, leading=17, textColor=DARK, fontName="Helvetica-Bold", spaceBefore=12, spaceAfter=4),
    "body": ParagraphStyle("body", fontSize=10.5, leading=15, textColor=DARK, fontName="Helvetica"),
    "body_sm": ParagraphStyle("body_sm", fontSize=9.5, leading=14, textColor=GRAY, fontName="Helvetica"),
    "bullet": ParagraphStyle("bullet", fontSize=10.5, leading=15, textColor=DARK, fontName="Helvetica", leftIndent=18, bulletIndent=6),
    "check": ParagraphStyle("check", fontSize=10.5, leading=15, textColor=DARK_GREEN, fontName="Helvetica", leftIndent=18, bulletIndent=6),
    "footer": ParagraphStyle("footer", fontSize=9, leading=12, textColor=GRAY, fontName="Helvetica", alignment=TA_CENTER),
    "th": ParagraphStyle("th", fontSize=9, leading=12, textColor=WHITE, fontName="Helvetica-Bold"),
    "td": ParagraphStyle("td", fontSize=9, leading=12, textColor=DARK, fontName="Helvetica"),
    "td_green": ParagraphStyle("td_green", fontSize=9, leading=12, textColor=DARK_GREEN, fontName="Helvetica-Bold"),
    "td_red": ParagraphStyle("td_red", fontSize=9, leading=12, textColor=RED, fontName="Helvetica"),
    "td_amber": ParagraphStyle("td_amber", fontSize=9, leading=12, textColor=AMBER, fontName="Helvetica"),
    "stat_num": ParagraphStyle("stat_num", fontSize=28, leading=32, textColor=GREEN, fontName="Helvetica-Bold", alignment=TA_CENTER),
    "stat_label": ParagraphStyle("stat_label", fontSize=9, leading=12, textColor=GRAY, fontName="Helvetica", alignment=TA_CENTER),
}

story = []

# ─── COVER ───
story.append(Spacer(1, 1.8*inch))
story.append(Paragraph("Parsley CMS", s["cover_title"]))
story.append(Spacer(1, 10))
story.append(Paragraph("Features & Market Comparison", s["cover_sub"]))
story.append(Spacer(1, 20))
story.append(Paragraph(
    "The first CMS built for AI search engines.<br/>"
    "Self-deployable. Open source. Zero-config SEO &amp; AEO.",
    s["cover_desc"]
))
story.append(Spacer(1, 40))
story.append(HRFlowable(width="30%", color=GREEN, thickness=2))
story.append(Spacer(1, 10))
story.append(Paragraph("2026 Edition", s["footer"]))
story.append(PageBreak())

# ─── TOC ───
story.append(Paragraph("Contents", s["h1"]))
toc = [
    "1. What is Parsley?",
    "2. Core Features",
    "3. AI Search Optimization (AEO)",
    "4. Content Hub System",
    "5. AI Writing Assistant",
    "6. 3D & AR Product Viewer",
    "7. Technical Architecture",
    "8. Market Comparison",
    "9. Pricing Model",
    "10. Roadmap",
]
for item in toc:
    story.append(Paragraph(item, s["body"]))
    story.append(Spacer(1, 4))
story.append(PageBreak())

# ─── 1. WHAT IS PARSLEY? ───
story.append(Paragraph("1. What is Parsley?", s["h1"]))
story.append(Paragraph(
    "Parsley is an open-source, self-deployable content management system built from the ground up "
    "for the AI search era. While traditional CMS platforms were designed for the Google PageRank era, "
    "Parsley is designed for a world where ChatGPT, Perplexity, Claude, and Google AI Overviews "
    "are how people find information.",
    s["body"]
))
story.append(Spacer(1, 10))
story.append(Paragraph(
    "Think of it as WordPress rebuilt for 2026 -- modern tech stack, AI-first optimization, "
    "and zero-plugin dependency for essential features.",
    s["body"]
))
story.append(Spacer(1, 14))

# Key stats
stats_data = [
    [Paragraph("68", s["stat_num"]), Paragraph("11K+", s["stat_num"]), Paragraph("0", s["stat_num"]), Paragraph("7", s["stat_num"])],
    [Paragraph("Source Files", s["stat_label"]), Paragraph("Lines of Code", s["stat_label"]), Paragraph("Plugins Required", s["stat_label"]), Paragraph("Days to Build", s["stat_label"])],
]
stats_table = Table(stats_data, colWidths=[1.7*inch]*4)
stats_table.setStyle(TableStyle([
    ("ALIGN", (0,0), (-1,-1), "CENTER"),
    ("VALIGN", (0,0), (-1,-1), "MIDDLE"),
    ("BOX", (0,0), (-1,-1), 1, HexColor("#e5e7eb")),
    ("INNERGRID", (0,0), (-1,-1), 0.5, HexColor("#e5e7eb")),
    ("BACKGROUND", (0,0), (-1,-1), HexColor("#f9fafb")),
    ("TOPPADDING", (0,0), (-1,-1), 10),
    ("BOTTOMPADDING", (0,0), (-1,-1), 10),
]))
story.append(stats_table)

# ─── 2. CORE FEATURES ───
story.append(Spacer(1, 8))
story.append(Paragraph("2. Core Features", s["h1"]))

features = [
    ("Authentication & User Management", [
        "Email/password authentication with NextAuth.js",
        "JWT-based sessions (stateless, fast)",
        "Admin and Editor roles",
        "Protected admin routes with middleware",
        "Signup flow with automatic site creation",
    ]),
    ("Block Editor", [
        "Tiptap-based rich text editor",
        "Headings (H1-H4), paragraphs, bold, italic, links",
        "Bullet and numbered lists, blockquotes, code blocks",
        "Image insertion and horizontal rules",
        "Floating toolbar with keyboard shortcuts",
        "Auto-save draft support",
    ]),
    ("Flexible Page System", [
        "Single unified page model (no posts vs pages split)",
        "8 content types: Page, Article, FAQ, Landing, Service, Product, Portfolio, Contact",
        "Content type drives Schema.org structured data automatically",
        "Collections for optional grouping (e.g., 'Blog', 'Services')",
        "Draft / Published / Archived status workflow",
        "Custom slug editor with auto-generation",
    ]),
    ("Admin Dashboard", [
        "Clean sidebar navigation (Dashboard, Pages, Hubs, Media, Navigation, Settings)",
        "Dashboard with stats: total pages, published, drafts, media count",
        "Quick actions and recent pages table",
        "Mobile-responsive admin UI",
    ]),
    ("Site Settings", [
        "Site name, tagline, description",
        "Logo and favicon upload",
        "Social links (Twitter, LinkedIn, GitHub, YouTube)",
        "Custom footer text",
        "Analytics snippet injection",
    ]),
    ("Navigation Editor", [
        "Add, edit, remove navigation links",
        "Drag-and-drop reordering",
        "Open in new tab option",
        "Navigation renders on public site header",
    ]),
    ("Media Library", [
        "Upload images with drag-and-drop",
        "Grid view of all uploads",
        "Alt text editing for accessibility",
        "Copy URL to clipboard",
        "Delete media with confirmation",
    ]),
]

for title, items in features:
    story.append(Paragraph(title, s["h2"]))
    for item in items:
        story.append(Paragraph(item, s["check"], bulletText="\u2713"))
        story.append(Spacer(1, 2))
    story.append(Spacer(1, 4))

story.append(PageBreak())

# ─── 3. AI SEARCH OPTIMIZATION ───
story.append(Paragraph("3. AI Search Optimization (AEO)", s["h1"]))
story.append(Paragraph(
    "Every Parsley site is automatically optimized for AI search engines with zero configuration. "
    "This is Parsley's core differentiator -- no plugins, no manual setup, no SEO expertise required.",
    s["body"]
))
story.append(Spacer(1, 10))

aeo_features = [
    ("llms.txt (Auto-Generated)",
     "A machine-readable file at /llms.txt that tells AI crawlers what your site is about, "
     "lists all published pages grouped by hubs and collections, and provides structured metadata. "
     "This is an emerging standard that no other CMS implements natively."),
    ("JSON-LD Schema.org (Per Page)",
     "Every page automatically gets structured data based on its content type. Articles get Article schema "
     "with author and dates. Pages get WebPage schema. Hub pages get CollectionPage + ItemList schema. "
     "FAQ pages can get FAQPage schema. All generated server-side."),
    ("sitemap.xml (Auto-Generated)",
     "A complete XML sitemap including all published pages, hub pages, and collection pages. "
     "Includes last modified dates, change frequency hints, and priority values. "
     "Hub pages get priority 0.8, landing pages get 0.9."),
    ("RSS Feed (Auto-Generated)",
     "A full RSS feed at /feed.xml with all published content. AI search engines use RSS "
     "for content discovery alongside sitemaps."),
    ("robots.txt (AI-Friendly)",
     "Explicitly allows all major AI crawlers: GPTBot, ClaudeBot, PerplexityBot, Google-Extended, "
     "Amazonbot, and more. References sitemap and llms.txt."),
    ("Server-Side Rendering",
     "Every page is rendered as complete HTML on the server. AI crawlers don't execute JavaScript, "
     "so SSR is essential. A curl request to any Parsley page returns full semantic HTML."),
    ("Semantic HTML",
     "Proper use of article, header, nav, main, section, footer elements. "
     "Correct heading hierarchy (single H1, nested H2-H4). Clean, parseable markup."),
    ("Canonical URLs & Open Graph",
     "Every page gets canonical URL, Open Graph tags, and Twitter Card meta. "
     "Prevents duplicate content issues and ensures proper previews when shared."),
]

for title, desc in aeo_features:
    story.append(Paragraph(title, s["h3"]))
    story.append(Paragraph(desc, s["body_sm"]))
    story.append(Spacer(1, 6))

story.append(PageBreak())

# ─── 4. CONTENT HUB SYSTEM ───
story.append(Paragraph("4. Content Hub System", s["h1"]))
story.append(Paragraph(
    "The Hub system organizes content into topic clusters -- the most effective structure "
    "for demonstrating topical authority to AI search engines. Each hub has a pillar page "
    "and related spoke pages, with automatic internal linking and structured data.",
    s["body"]
))
story.append(Spacer(1, 10))

hub_features = [
    "Create hubs with name, slug, description, and SEO metadata",
    "Assign any page as a pillar (main guide) for a hub",
    "Link pages as spokes from the page editor dropdown",
    "Auto-generated hub landing pages at /hub/[slug]",
    "Automatic breadcrumbs on spoke pages (Home > Hub > Page)",
    "'Related in this hub' section on spoke pages",
    "CollectionPage + ItemList JSON-LD on hub pages",
    "BreadcrumbList + isPartOf schema on spoke pages",
    "llms.txt groups content by hub with pillar/spoke hierarchy",
    "Hub pages in sitemap.xml with 0.8 priority",
]

for feature in hub_features:
    story.append(Paragraph(feature, s["check"], bulletText="\u2713"))
    story.append(Spacer(1, 2))

# ─── 5. AI WRITING ASSISTANT ───
story.append(Spacer(1, 8))
story.append(Paragraph("5. AI Writing Assistant", s["h1"]))
story.append(Paragraph(
    "A Claude-powered writing assistant built directly into the editor. "
    "Streams responses in real-time and can insert generated content with one click.",
    s["body"]
))
story.append(Spacer(1, 10))

ai_actions = [
    ("Write", "Generate content from a prompt, aware of page title, content type, and hub"),
    ("Outline", "Create a structured content outline with headings and bullet points"),
    ("FAQ", "Generate 5-8 frequently asked questions with detailed answers"),
    ("Improve", "Enhance existing content for clarity, engagement, and AI search optimization"),
    ("Expand", "Add more detail, examples, and depth to existing content"),
    ("Shorten", "Make content more concise while keeping key points"),
    ("SEO Tips", "Get meta title, description, structure improvements, and missing subtopics"),
    ("Hub Ideas", "Suggest spoke article ideas for the current hub to strengthen topical authority"),
]

for action, desc in ai_actions:
    story.append(Paragraph(f"<b>{action}</b> -- {desc}", s["bullet"], bulletText="\u2022"))
    story.append(Spacer(1, 2))

story.append(Spacer(1, 8))
story.append(Paragraph("Technical: Streaming via SSE, abort support, context-aware prompting, hub-aware suggestions.", s["body_sm"]))

# ─── 6. 3D & AR ───
story.append(Spacer(1, 8))
story.append(Paragraph("6. 3D & AR Product Viewer", s["h1"]))
story.append(Paragraph(
    "Native support for interactive 3D models using React Three Fiber and Three.js. "
    "Drop a .glb file into the public directory and it renders as an interactive 3D viewer "
    "with orbit controls, auto-rotation, and responsive sizing. No plugins or third-party embeds needed.",
    s["body"]
))
story.append(Spacer(1, 8))
features_3d = [
    "GLB/GLTF model loading with React Three Fiber",
    "Orbit controls (rotate, zoom, pan)",
    "Auto-rotation with pause on interaction",
    "Environment lighting and shadows",
    "Responsive sizing for all screen sizes",
    "Multiple viewers per page",
    "USDZ support planned for iOS AR Quick Look",
]
for f in features_3d:
    story.append(Paragraph(f, s["check"], bulletText="\u2713"))
    story.append(Spacer(1, 2))

story.append(PageBreak())

# ─── 7. TECHNICAL ARCHITECTURE ───
story.append(Paragraph("7. Technical Architecture", s["h1"]))

tech_data = [
    [Paragraph("<b>Layer</b>", s["th"]), Paragraph("<b>Technology</b>", s["th"]), Paragraph("<b>Why</b>", s["th"])],
    [Paragraph("Framework", s["td"]), Paragraph("Next.js 16 (App Router)", s["td"]), Paragraph("SSR, ISR, middleware, edge rendering", s["td"])],
    [Paragraph("Language", s["td"]), Paragraph("TypeScript 5", s["td"]), Paragraph("Type safety across full stack", s["td"])],
    [Paragraph("Database", s["td"]), Paragraph("PostgreSQL + Prisma 7", s["td"]), Paragraph("Reliable, scalable, great ORM", s["td"])],
    [Paragraph("Auth", s["td"]), Paragraph("NextAuth.js 4 (JWT)", s["td"]), Paragraph("Flexible, stateless sessions", s["td"])],
    [Paragraph("Editor", s["td"]), Paragraph("Tiptap (ProseMirror)", s["td"]), Paragraph("Extensible block editor, JSON output", s["td"])],
    [Paragraph("Styling", s["td"]), Paragraph("Tailwind CSS 4", s["td"]), Paragraph("Utility-first, fast development", s["td"])],
    [Paragraph("AI", s["td"]), Paragraph("Anthropic Claude API", s["td"]), Paragraph("Best writing quality, streaming", s["td"])],
    [Paragraph("3D", s["td"]), Paragraph("React Three Fiber + Three.js", s["td"]), Paragraph("Native 3D without plugins", s["td"])],
    [Paragraph("Hosting", s["td"]), Paragraph("Vercel / Docker", s["td"]), Paragraph("Edge rendering + self-host option", s["td"])],
    [Paragraph("DB Hosting", s["td"]), Paragraph("Neon / Supabase / Self", s["td"]), Paragraph("Serverless Postgres, free tier", s["td"])],
]

tech_table = Table(tech_data, colWidths=[1.3*inch, 2.0*inch, 3.2*inch])
tech_table.setStyle(TableStyle([
    ("BACKGROUND", (0,0), (-1,0), GREEN),
    ("TEXTCOLOR", (0,0), (-1,0), WHITE),
    ("GRID", (0,0), (-1,-1), 0.5, HexColor("#e5e7eb")),
    ("ROWBACKGROUNDS", (0,1), (-1,-1), [WHITE, LIGHT_GRAY]),
    ("TOPPADDING", (0,0), (-1,-1), 6),
    ("BOTTOMPADDING", (0,0), (-1,-1), 6),
    ("LEFTPADDING", (0,0), (-1,-1), 8),
    ("VALIGN", (0,0), (-1,-1), "MIDDLE"),
]))
story.append(tech_table)

story.append(PageBreak())

# ─── 8. MARKET COMPARISON ───
story.append(Paragraph("8. Market Comparison", s["h1"]))
story.append(Paragraph(
    "How Parsley compares to every major CMS platform on the market today.",
    s["body"]
))
story.append(Spacer(1, 12))

# Helper
def cell(text, style_name="td"):
    return Paragraph(text, s[style_name])

def yes():
    return Paragraph("\u2713 Built-in", s["td_green"])

def no():
    return Paragraph("\u2717 No", s["td_red"])

def plugin():
    return Paragraph("~ Plugin", s["td_amber"])

def partial():
    return Paragraph("~ Partial", s["td_amber"])

def manual():
    return Paragraph("~ Manual", s["td_amber"])

# --- Table 1: Core Features ---
story.append(Paragraph("Core Features", s["h2"]))

core_header = [cell("<b>Feature</b>", "th"), cell("<b>Parsley</b>", "th"), cell("<b>WordPress</b>", "th"),
               cell("<b>Ghost</b>", "th"), cell("<b>Webflow</b>", "th"), cell("<b>Squarespace</b>", "th")]

core_data = [
    core_header,
    [cell("Open Source"), yes(), yes(), yes(), no(), no()],
    [cell("Self-Deployable"), yes(), yes(), yes(), no(), no()],
    [cell("Modern Stack (React)"), yes(), no(), partial(), no(), no()],
    [cell("Block Editor"), yes(), yes(), yes(), yes(), yes()],
    [cell("SSR by Default"), yes(), no(), yes(), yes(), yes()],
    [cell("TypeScript"), yes(), no(), no(), no(), no()],
    [cell("REST API"), yes(), plugin(), yes(), yes(), partial()],
    [cell("User Roles"), yes(), yes(), yes(), partial(), yes()],
    [cell("Custom Themes"), yes(), yes(), yes(), yes(), yes()],
    [cell("Free Tier"), yes(), yes(), yes(), no(), no()],
]

cw = [1.3*inch, 1.05*inch, 1.05*inch, 1.05*inch, 1.05*inch, 1.05*inch]
core_table = Table(core_data, colWidths=cw)
core_table.setStyle(TableStyle([
    ("BACKGROUND", (0,0), (-1,0), GREEN),
    ("BACKGROUND", (1,1), (1,-1), HexColor("#f0fdf4")),
    ("GRID", (0,0), (-1,-1), 0.5, HexColor("#e5e7eb")),
    ("ROWBACKGROUNDS", (0,1), (-1,-1), [WHITE, LIGHT_GRAY]),
    ("TOPPADDING", (0,0), (-1,-1), 5),
    ("BOTTOMPADDING", (0,0), (-1,-1), 5),
    ("LEFTPADDING", (0,0), (-1,-1), 6),
    ("VALIGN", (0,0), (-1,-1), "MIDDLE"),
]))
story.append(core_table)
story.append(Spacer(1, 14))

# --- Table 2: AI/SEO Features ---
story.append(Paragraph("AI Search Optimization (AEO)", s["h2"]))

seo_header = [cell("<b>Feature</b>", "th"), cell("<b>Parsley</b>", "th"), cell("<b>WordPress</b>", "th"),
              cell("<b>Ghost</b>", "th"), cell("<b>Webflow</b>", "th"), cell("<b>Squarespace</b>", "th")]

seo_data = [
    seo_header,
    [cell("llms.txt"), yes(), no(), no(), no(), no()],
    [cell("Auto JSON-LD Schema"), yes(), plugin(), partial(), manual(), partial()],
    [cell("Auto Sitemap"), yes(), plugin(), yes(), yes(), yes()],
    [cell("Auto RSS Feed"), yes(), yes(), yes(), no(), partial()],
    [cell("AI-Friendly robots.txt"), yes(), manual(), no(), no(), no()],
    [cell("Content Hubs"), yes(), no(), no(), no(), no()],
    [cell("Hub Schema (CollectionPage)"), yes(), no(), no(), no(), no()],
    [cell("Auto Breadcrumbs"), yes(), plugin(), no(), manual(), partial()],
    [cell("Canonical URLs"), yes(), plugin(), yes(), yes(), yes()],
    [cell("AI Writing Assistant"), yes(), plugin(), no(), no(), yes()],
    [cell("SEO/AEO Suggestions"), yes(), plugin(), no(), no(), partial()],
]

seo_table = Table(seo_data, colWidths=cw)
seo_table.setStyle(TableStyle([
    ("BACKGROUND", (0,0), (-1,0), GREEN),
    ("BACKGROUND", (1,1), (1,-1), HexColor("#f0fdf4")),
    ("GRID", (0,0), (-1,-1), 0.5, HexColor("#e5e7eb")),
    ("ROWBACKGROUNDS", (0,1), (-1,-1), [WHITE, LIGHT_GRAY]),
    ("TOPPADDING", (0,0), (-1,-1), 5),
    ("BOTTOMPADDING", (0,0), (-1,-1), 5),
    ("LEFTPADDING", (0,0), (-1,-1), 6),
    ("VALIGN", (0,0), (-1,-1), "MIDDLE"),
]))
story.append(seo_table)

story.append(PageBreak())

# --- Table 3: Extended comparison with Joomla, Drupal, Payload, Strapi ---
story.append(Paragraph("Extended CMS Comparison", s["h2"]))
story.append(Paragraph(
    "Including legacy CMS platforms (Joomla, Drupal) and modern headless options (Payload, Strapi).",
    s["body_sm"]
))
story.append(Spacer(1, 10))

ext_header = [cell("<b>Feature</b>", "th"), cell("<b>Parsley</b>", "th"), cell("<b>Joomla</b>", "th"),
              cell("<b>Drupal</b>", "th"), cell("<b>Payload</b>", "th"), cell("<b>Strapi</b>", "th")]

ext_data = [
    ext_header,
    [cell("Still Relevant (2026)?"), yes(), Paragraph("Declining", s["td_amber"]), partial(), yes(), yes()],
    [cell("Modern Stack"), yes(), no(), no(), yes(), partial()],
    [cell("Self-Deployable"), yes(), yes(), yes(), yes(), yes()],
    [cell("llms.txt"), yes(), no(), no(), no(), no()],
    [cell("Auto Schema.org"), yes(), plugin(), plugin(), no(), no()],
    [cell("Content Hubs"), yes(), no(), partial(), no(), no()],
    [cell("AI Writer Built-in"), yes(), no(), no(), no(), no()],
    [cell("3D Product Viewer"), yes(), no(), no(), no(), no()],
    [cell("Block Editor"), yes(), partial(), partial(), yes(), partial()],
    [cell("Learning Curve"), cell("Low"), cell("Medium"), cell("High"), cell("Medium"), cell("Medium")],
    [cell("Plugin Ecosystem"), cell("Growing"), cell("Large"), cell("Large"), cell("Small"), cell("Medium")],
    [cell("Community Size"), cell("New"), cell("Shrinking"), cell("Stable"), cell("Growing"), cell("Growing")],
]

ext_table = Table(ext_data, colWidths=cw)
ext_table.setStyle(TableStyle([
    ("BACKGROUND", (0,0), (-1,0), GREEN),
    ("BACKGROUND", (1,1), (1,-1), HexColor("#f0fdf4")),
    ("GRID", (0,0), (-1,-1), 0.5, HexColor("#e5e7eb")),
    ("ROWBACKGROUNDS", (0,1), (-1,-1), [WHITE, LIGHT_GRAY]),
    ("TOPPADDING", (0,0), (-1,-1), 5),
    ("BOTTOMPADDING", (0,0), (-1,-1), 5),
    ("LEFTPADDING", (0,0), (-1,-1), 6),
    ("VALIGN", (0,0), (-1,-1), "MIDDLE"),
]))
story.append(ext_table)

story.append(Spacer(1, 14))

# Joomla note
story.append(Paragraph("A Note on Joomla", s["h3"]))
story.append(Paragraph(
    "Joomla 5.x (released 2023) brought modern PHP 8.1+ support and improved admin UI, but its "
    "market share has been declining steadily. As of 2026, Joomla powers roughly 1.5% of all websites "
    "(down from 3.3% in 2020). Its PHP-based architecture means no SSR for AI crawlers, no native "
    "structured data, and no modern JavaScript framework. Joomla remains viable for existing sites "
    "but is not a strong choice for new projects focused on AI search visibility.",
    s["body_sm"]
))

story.append(Spacer(1, 10))
story.append(Paragraph("A Note on Drupal", s["h3"]))
story.append(Paragraph(
    "Drupal 11 is powerful for enterprise content management with complex taxonomies and workflows. "
    "However, its steep learning curve, PHP rendering, and plugin dependency for basic SEO features "
    "make it overkill for most sites. Its structured content model is strong but requires significant "
    "development expertise to leverage for AI search optimization.",
    s["body_sm"]
))

story.append(PageBreak())

# ─── 9. PRICING MODEL ───
story.append(Paragraph("9. Pricing Model", s["h1"]))
story.append(Paragraph(
    "Parsley follows the WordPress.org / WordPress.com dual model:",
    s["body"]
))
story.append(Spacer(1, 12))

pricing_data = [
    [Paragraph("<b>Tier</b>", s["th"]), Paragraph("<b>Price</b>", s["th"]), Paragraph("<b>Includes</b>", s["th"])],
    [Paragraph("<b>Parsley Core</b>", s["td"]), Paragraph("Free", s["td_green"]),
     Paragraph("Open source, self-host, full CMS, all features, community support", s["td"])],
    [Paragraph("<b>Parsley Cloud</b>", s["td"]), Paragraph("$29/mo", s["td"]),
     Paragraph("Managed hosting, Neon DB, CDN, custom domain, email support, auto-updates", s["td"])],
    [Paragraph("<b>Parsley Agency</b>", s["td"]), Paragraph("$99/mo", s["td"]),
     Paragraph("10 sites, white-label, WP importer, priority support, template marketplace access", s["td"])],
    [Paragraph("<b>Parsley Enterprise</b>", s["td"]), Paragraph("Custom", s["td"]),
     Paragraph("Unlimited sites, SLA, dedicated support, custom integrations, on-prem option", s["td"])],
]

pricing_table = Table(pricing_data, colWidths=[1.5*inch, 1.0*inch, 4.0*inch])
pricing_table.setStyle(TableStyle([
    ("BACKGROUND", (0,0), (-1,0), GREEN),
    ("GRID", (0,0), (-1,-1), 0.5, HexColor("#e5e7eb")),
    ("ROWBACKGROUNDS", (0,1), (-1,-1), [WHITE, LIGHT_GRAY]),
    ("TOPPADDING", (0,0), (-1,-1), 8),
    ("BOTTOMPADDING", (0,0), (-1,-1), 8),
    ("LEFTPADDING", (0,0), (-1,-1), 8),
    ("VALIGN", (0,0), (-1,-1), "MIDDLE"),
]))
story.append(pricing_table)

# ─── 10. ROADMAP ───
story.append(Spacer(1, 16))
story.append(Paragraph("10. Roadmap", s["h1"]))

roadmap = [
    ("Q2 2026 -- Next Up", [
        "Plugin/extension system",
        "WordPress content importer",
        "Template marketplace",
        "Multi-language support (i18n)",
        "Contact form plugin",
    ]),
    ("Q3 2026 -- Growth", [
        "Multi-tenancy (cloud platform)",
        "AI crawl analytics dashboard",
        "E-commerce plugin (Stripe)",
        "Email newsletter integration",
        "Custom domain management",
    ]),
    ("Q4 2026 -- Enterprise", [
        "Collaboration (multiple editors)",
        "Version history and rollback",
        "Headless API mode",
        "USDZ/AR Quick Look for iOS",
        "White-label admin customization",
    ]),
]

for phase, items in roadmap:
    story.append(Paragraph(phase, s["h3"]))
    for item in items:
        story.append(Paragraph(item, s["bullet"], bulletText="\u2022"))
        story.append(Spacer(1, 2))
    story.append(Spacer(1, 6))

# ─── FOOTER ───
story.append(Spacer(1, 24))
story.append(HRFlowable(width="100%", color=GREEN, thickness=2))
story.append(Spacer(1, 10))
story.append(Paragraph("Parsley CMS -- Built for the AI search era", s["footer"]))
story.append(Paragraph("https://parsley.dev | github.com/Neilaj/parsley", s["footer"]))

# Build
doc.build(story)
print(f"PDF generated: {OUTPUT}")
