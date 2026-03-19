#!/usr/bin/env python3
"""Generate WordPress Migration & Plugin System Guide PDF"""

from reportlab.lib.pagesizes import letter
from reportlab.lib.units import inch
from reportlab.lib.colors import HexColor
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib.enums import TA_LEFT, TA_CENTER
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle,
    PageBreak, HRFlowable
)

GREEN = HexColor("#16a34a")
DARK_GREEN = HexColor("#15803d")
DARK = HexColor("#111827")
GRAY = HexColor("#6b7280")
LIGHT_GRAY = HexColor("#f3f4f6")
WHITE = HexColor("#ffffff")
VIOLET = HexColor("#7c3aed")
BLUE = HexColor("#2563eb")
BLUE_BG = HexColor("#eff6ff")
AMBER = HexColor("#d97706")
AMBER_BG = HexColor("#fffbeb")
RED = HexColor("#dc2626")

OUTPUT = "/Users/neilajodah/Desktop/parsley/public/docs/parsley-wordpress-migration-and-plugins.pdf"

doc = SimpleDocTemplate(OUTPUT, pagesize=letter,
    leftMargin=0.7*inch, rightMargin=0.7*inch,
    topMargin=0.7*inch, bottomMargin=0.7*inch)

s = {
    "cover_title": ParagraphStyle("ct", fontSize=36, leading=42, textColor=DARK, fontName="Helvetica-Bold", alignment=TA_CENTER),
    "cover_sub": ParagraphStyle("cs", fontSize=16, leading=22, textColor=GREEN, fontName="Helvetica", alignment=TA_CENTER),
    "cover_desc": ParagraphStyle("cd", fontSize=11, leading=16, textColor=GRAY, fontName="Helvetica", alignment=TA_CENTER),
    "h1": ParagraphStyle("h1", fontSize=24, leading=30, textColor=DARK, fontName="Helvetica-Bold", spaceBefore=20, spaceAfter=10),
    "h2": ParagraphStyle("h2", fontSize=16, leading=22, textColor=DARK_GREEN, fontName="Helvetica-Bold", spaceBefore=16, spaceAfter=6),
    "h3": ParagraphStyle("h3", fontSize=13, leading=17, textColor=DARK, fontName="Helvetica-Bold", spaceBefore=12, spaceAfter=4),
    "body": ParagraphStyle("body", fontSize=10.5, leading=15, textColor=DARK, fontName="Helvetica"),
    "body_sm": ParagraphStyle("body_sm", fontSize=9.5, leading=14, textColor=GRAY, fontName="Helvetica"),
    "bullet": ParagraphStyle("bullet", fontSize=10.5, leading=15, textColor=DARK, fontName="Helvetica", leftIndent=18, bulletIndent=6),
    "check": ParagraphStyle("check", fontSize=10.5, leading=15, textColor=DARK_GREEN, fontName="Helvetica", leftIndent=18, bulletIndent=6),
    "code": ParagraphStyle("code", fontSize=9, leading=13, textColor=DARK, fontName="Courier", backColor=LIGHT_GRAY, leftIndent=10, rightIndent=10, spaceBefore=4, spaceAfter=4),
    "tip": ParagraphStyle("tip", fontSize=10, leading=14, textColor=HexColor("#1e40af"), fontName="Helvetica", leftIndent=10, rightIndent=10),
    "warn": ParagraphStyle("warn", fontSize=10, leading=14, textColor=HexColor("#92400e"), fontName="Helvetica", leftIndent=10, rightIndent=10),
    "footer": ParagraphStyle("footer", fontSize=9, leading=12, textColor=GRAY, fontName="Helvetica", alignment=TA_CENTER),
    "th": ParagraphStyle("th", fontSize=9, leading=12, textColor=WHITE, fontName="Helvetica-Bold"),
    "td": ParagraphStyle("td", fontSize=9, leading=13, textColor=DARK, fontName="Helvetica"),
    "num": ParagraphStyle("num", fontSize=32, leading=36, textColor=GREEN, fontName="Helvetica-Bold", alignment=TA_CENTER),
    "num_label": ParagraphStyle("nl", fontSize=9, leading=12, textColor=GRAY, fontName="Helvetica", alignment=TA_CENTER),
}

story = []

# ─── COVER ───
story.append(Spacer(1, 1.5*inch))
story.append(Paragraph("Parsley CMS", s["cover_title"]))
story.append(Spacer(1, 10))
story.append(Paragraph("WordPress Migration Guide<br/>&amp; Plugin Development System", s["cover_sub"]))
story.append(Spacer(1, 24))
story.append(Paragraph(
    "How to move from WordPress to Parsley in minutes,<br/>"
    "and how to extend Parsley with custom plugins.",
    s["cover_desc"]
))
story.append(Spacer(1, 40))
story.append(HRFlowable(width="30%", color=GREEN, thickness=2))
story.append(Spacer(1, 10))
story.append(Paragraph("Technical Specification &amp; Architecture Document", s["footer"]))
story.append(PageBreak())

# ─── TOC ───
story.append(Paragraph("Contents", s["h1"]))
toc = [
    "Part 1: WordPress Migration",
    "  1. Migration Overview",
    "  2. How the Importer Works",
    "  3. What Gets Migrated",
    "  4. Content Transformation Pipeline",
    "  5. The User Experience",
    "  6. Handling Edge Cases",
    "  7. Post-Migration Checklist",
    "",
    "Part 2: Plugin System",
    "  8. Plugin Architecture Overview",
    "  9. Plugin Structure",
    "  10. Plugin Hooks & Extension Points",
    "  11. Building Your First Plugin",
    "  12. Plugin Examples",
    "  13. Plugin Distribution",
]
for item in toc:
    if item == "":
        story.append(Spacer(1, 6))
    else:
        story.append(Paragraph(item, s["body"]))
        story.append(Spacer(1, 3))
story.append(PageBreak())

# ═══════════════════════════════════════════
# PART 1: WORDPRESS MIGRATION
# ═══════════════════════════════════════════
story.append(Paragraph("Part 1: WordPress Migration", s["h1"]))
story.append(HRFlowable(width="100%", color=GREEN, thickness=2))
story.append(Spacer(1, 16))

# 1. Overview
story.append(Paragraph("1. Migration Overview", s["h1"]))
story.append(Paragraph(
    "The number one barrier to CMS adoption is migration pain. WordPress powers over 40% of all "
    "websites, and convincing agencies and site owners to switch requires making migration effortless. "
    "The Parsley WordPress Importer is designed to be a one-click migration tool that preserves "
    "100% of content, images, and SEO metadata.",
    s["body"]
))
story.append(Spacer(1, 14))

# Stats
stats = [
    [Paragraph("43%", s["num"]), Paragraph("835M", s["num"]), Paragraph("&lt; 5 min", s["num"])],
    [Paragraph("Web runs WordPress", s["num_label"]), Paragraph("WordPress sites exist", s["num_label"]),
     Paragraph("Target migration time", s["num_label"])],
]
st = Table(stats, colWidths=[2.2*inch]*3)
st.setStyle(TableStyle([
    ("ALIGN", (0,0), (-1,-1), "CENTER"),
    ("BOX", (0,0), (-1,-1), 1, HexColor("#e5e7eb")),
    ("INNERGRID", (0,0), (-1,-1), 0.5, HexColor("#e5e7eb")),
    ("BACKGROUND", (0,0), (-1,-1), HexColor("#f9fafb")),
    ("TOPPADDING", (0,0), (-1,-1), 10),
    ("BOTTOMPADDING", (0,0), (-1,-1), 10),
]))
story.append(st)
story.append(Spacer(1, 10))

story.append(Paragraph("The Guiding Principle", s["h3"]))
story.append(Paragraph(
    "Migration should feel like uploading a file, not hiring a developer. The user provides their "
    "WordPress site URL (or an export file), and Parsley handles everything else automatically.",
    s["body_sm"]
))

# 2. How the Importer Works
story.append(Spacer(1, 8))
story.append(Paragraph("2. How the Importer Works", s["h1"]))
story.append(Paragraph("The importer supports two input methods:", s["body"]))
story.append(Spacer(1, 8))

story.append(Paragraph("Method A: Live Site URL (Recommended)", s["h2"]))
story.append(Paragraph(
    "The user enters their WordPress site URL. Parsley connects to the WordPress REST API "
    "(available on all WordPress sites since v4.7, 2016) and pulls content automatically.",
    s["body"]
))
story.append(Spacer(1, 6))

steps_a = [
    "User enters WordPress URL in Parsley admin (e.g., https://mysite.com)",
    "Parsley calls /wp-json/wp/v2/posts, /pages, /media, /categories, /tags, /menus",
    "Content is fetched in paginated batches (100 items per request)",
    "Images are downloaded and re-uploaded to Parsley's media library",
    "HTML content is converted to Tiptap JSON (Parsley's editor format)",
    "SEO metadata is extracted from Yoast/RankMath if present (via REST API extensions)",
    "Pages are created in Parsley with correct slugs, dates, and status",
    "Navigation menus are recreated in Parsley's navigation system",
    "User reviews the import summary and confirms",
]
for i, step in enumerate(steps_a, 1):
    story.append(Paragraph(step, s["bullet"], bulletText=f"{i}."))
    story.append(Spacer(1, 2))

story.append(Spacer(1, 10))
story.append(Paragraph("Method B: WXR File Upload", s["h2"]))
story.append(Paragraph(
    "For sites with REST API disabled or behind authentication, users can export a WordPress "
    "eXtended RSS (WXR) file from wp-admin > Tools > Export and upload it to Parsley.",
    s["body"]
))
story.append(Spacer(1, 6))

steps_b = [
    "User exports WXR XML file from WordPress admin",
    "User uploads the .xml file in Parsley's import page",
    "Parsley parses the WXR format (XML with wp: namespace extensions)",
    "Same transformation pipeline as Method A processes the content",
    "Images referenced in content are downloaded from their original URLs",
    "Import completes with summary report",
]
for i, step in enumerate(steps_b, 1):
    story.append(Paragraph(step, s["bullet"], bulletText=f"{i}."))
    story.append(Spacer(1, 2))

story.append(PageBreak())

# 3. What Gets Migrated
story.append(Paragraph("3. What Gets Migrated", s["h1"]))

migration_table_data = [
    [Paragraph("<b>WordPress Item</b>", s["th"]), Paragraph("<b>Parsley Equivalent</b>", s["th"]),
     Paragraph("<b>Notes</b>", s["th"])],
    [Paragraph("Posts", s["td"]), Paragraph("Pages (type: Article)", s["td"]),
     Paragraph("Mapped to Article content type with collection 'Blog'", s["td"])],
    [Paragraph("Pages", s["td"]), Paragraph("Pages (type: Page)", s["td"]),
     Paragraph("Direct 1:1 mapping", s["td"])],
    [Paragraph("Categories", s["td"]), Paragraph("Hubs", s["td"]),
     Paragraph("Each category becomes a Hub; posts become spokes", s["td"])],
    [Paragraph("Tags", s["td"]), Paragraph("Collections", s["td"]),
     Paragraph("Tags map to the collection field for grouping", s["td"])],
    [Paragraph("Featured Images", s["td"]), Paragraph("OG Image + Media", s["td"]),
     Paragraph("Downloaded to media library, set as OG image", s["td"])],
    [Paragraph("Inline Images", s["td"]), Paragraph("Media Library", s["td"]),
     Paragraph("Downloaded, re-linked to new URLs", s["td"])],
    [Paragraph("Menus", s["td"]), Paragraph("Navigation", s["td"]),
     Paragraph("Menu items become navigation entries with order preserved", s["td"])],
    [Paragraph("Yoast Meta Title", s["td"]), Paragraph("metaTitle field", s["td"]),
     Paragraph("Extracted via Yoast REST API extension", s["td"])],
    [Paragraph("Yoast Meta Desc", s["td"]), Paragraph("metaDescription field", s["td"]),
     Paragraph("Preserved exactly", s["td"])],
    [Paragraph("Post Excerpts", s["td"]), Paragraph("excerpt field", s["td"]),
     Paragraph("Direct mapping", s["td"])],
    [Paragraph("Publish Date", s["td"]), Paragraph("publishedAt", s["td"]),
     Paragraph("Original publish date preserved", s["td"])],
    [Paragraph("Draft Status", s["td"]), Paragraph("DRAFT status", s["td"]),
     Paragraph("Drafts remain drafts in Parsley", s["td"])],
    [Paragraph("Slugs / Permalinks", s["td"]), Paragraph("slug field", s["td"]),
     Paragraph("Preserved exactly for URL continuity", s["td"])],
    [Paragraph("Author", s["td"]), Paragraph("author relation", s["td"]),
     Paragraph("Mapped to importing user (multi-author support later)", s["td"])],
    [Paragraph("Comments", s["td"]), Paragraph("Not imported (yet)", s["td"]),
     Paragraph("Future: Comments plugin will support import", s["td"])],
    [Paragraph("Custom Fields", s["td"]), Paragraph("Not imported (yet)", s["td"]),
     Paragraph("Future: Extensible via plugin hooks", s["td"])],
    [Paragraph("WooCommerce", s["td"]), Paragraph("Not imported (yet)", s["td"]),
     Paragraph("Future: E-commerce plugin will support import", s["td"])],
]

mt = Table(migration_table_data, colWidths=[1.5*inch, 1.7*inch, 3.3*inch])
mt.setStyle(TableStyle([
    ("BACKGROUND", (0,0), (-1,0), GREEN),
    ("GRID", (0,0), (-1,-1), 0.5, HexColor("#e5e7eb")),
    ("ROWBACKGROUNDS", (0,1), (-1,-1), [WHITE, LIGHT_GRAY]),
    ("TOPPADDING", (0,0), (-1,-1), 4),
    ("BOTTOMPADDING", (0,0), (-1,-1), 4),
    ("LEFTPADDING", (0,0), (-1,-1), 6),
    ("VALIGN", (0,0), (-1,-1), "TOP"),
]))
story.append(mt)

story.append(Spacer(1, 10))
story.append(Paragraph(
    "Key insight: WordPress Categories become Parsley Hubs automatically. "
    "A site with categories like 'Web Design', 'Marketing', 'SEO' will get three content hubs "
    "with all related posts as spokes -- instant topic cluster structure that WordPress never had.",
    s["body"]
))

story.append(PageBreak())

# 4. Content Transformation Pipeline
story.append(Paragraph("4. Content Transformation Pipeline", s["h1"]))
story.append(Paragraph(
    "WordPress content is stored as HTML (with Gutenberg block comments). Parsley's editor "
    "uses Tiptap JSON. The transformation pipeline converts between these formats while "
    "preserving all content structure.",
    s["body"]
))
story.append(Spacer(1, 10))

story.append(Paragraph("Pipeline Steps", s["h2"]))
pipeline = [
    ("Fetch Raw HTML", "Pull the rendered content from wp/v2/posts?_fields=content.rendered"),
    ("Strip Gutenberg Comments", "Remove &lt;!-- wp:paragraph --&gt; block markers (informational only)"),
    ("Parse HTML to DOM", "Use a server-side DOM parser (cheerio/jsdom) to build an AST"),
    ("Normalize Elements", "Map WP-specific classes to standard HTML (wp-block-image to img, etc.)"),
    ("Download Images", "Find all img src URLs, download to Parsley media, rewrite src attributes"),
    ("Convert to Tiptap JSON", "Walk the DOM tree and produce Tiptap-compatible JSON nodes"),
    ("Extract Metadata", "Pull title, slug, excerpt, featured image, categories, tags from API response"),
    ("Map to Parsley Schema", "Create Page records with all fields populated"),
    ("Create Hub Relations", "Link pages to hubs based on their WordPress categories"),
    ("Generate AI Optimization", "Auto-fill missing meta descriptions using AI if enabled"),
]
for i, (title, desc) in enumerate(pipeline, 1):
    story.append(Paragraph(f"<b>Step {i}: {title}</b>", s["h3"]))
    story.append(Paragraph(desc, s["body_sm"]))
    story.append(Spacer(1, 4))

story.append(Spacer(1, 8))
story.append(Paragraph("HTML to Tiptap JSON Example", s["h3"]))
story.append(Paragraph("WordPress HTML:", s["body_sm"]))
story.append(Paragraph('&lt;h2&gt;Getting Started&lt;/h2&gt;', s["code"]))
story.append(Paragraph('&lt;p&gt;Here is how to &lt;strong&gt;begin&lt;/strong&gt;.&lt;/p&gt;', s["code"]))
story.append(Spacer(1, 4))
story.append(Paragraph("Tiptap JSON output:", s["body_sm"]))
story.append(Paragraph('{ "type": "heading", "attrs": { "level": 2 },', s["code"]))
story.append(Paragraph('  "content": [{ "type": "text", "text": "Getting Started" }] }', s["code"]))
story.append(Paragraph('{ "type": "paragraph",', s["code"]))
story.append(Paragraph('  "content": [', s["code"]))
story.append(Paragraph('    { "type": "text", "text": "Here is how to " },', s["code"]))
story.append(Paragraph('    { "type": "text", "marks": [{"type":"bold"}], "text": "begin" },', s["code"]))
story.append(Paragraph('    { "type": "text", "text": "." }', s["code"]))
story.append(Paragraph('  ] }', s["code"]))

story.append(PageBreak())

# 5. User Experience
story.append(Paragraph("5. The User Experience", s["h1"]))
story.append(Paragraph(
    "The import flow is designed to feel like a 3-step wizard, completable in under 5 minutes "
    "for a typical WordPress site with 50-200 posts.",
    s["body"]
))
story.append(Spacer(1, 10))

story.append(Paragraph("Step 1: Connect", s["h2"]))
story.append(Paragraph(
    "User goes to /admin/import and enters their WordPress URL or uploads a WXR file. "
    "Parsley validates the connection, checks API availability, and shows the site name "
    "and content counts (e.g., '47 posts, 12 pages, 156 images found').",
    s["body"]
))
story.append(Spacer(1, 8))

story.append(Paragraph("Step 2: Preview & Configure", s["h2"]))
story.append(Paragraph(
    "Parsley shows a preview of what will be imported with checkboxes for each content type. "
    "The user can:",
    s["body"]
))
story.append(Spacer(1, 4))
preview_options = [
    "Select which posts/pages to import (all selected by default)",
    "Choose whether to convert categories to hubs (recommended, on by default)",
    "Map WordPress authors to Parsley users",
    "Choose to auto-generate missing meta descriptions with AI",
    "Set a URL redirect strategy (preserve slugs or create new ones)",
]
for opt in preview_options:
    story.append(Paragraph(opt, s["bullet"], bulletText="\u2022"))
    story.append(Spacer(1, 2))

story.append(Spacer(1, 8))
story.append(Paragraph("Step 3: Import & Review", s["h2"]))
story.append(Paragraph(
    "User clicks 'Start Import'. A real-time progress bar shows items being processed. "
    "When complete, a summary report shows:",
    s["body"]
))
story.append(Spacer(1, 4))
summary_items = [
    "Total pages created (with links to edit each one)",
    "Total hubs created from categories",
    "Total images downloaded",
    "Any items that failed or need attention",
    "SEO score comparison (before vs after, if Yoast data was available)",
    "Button: 'View your new site' to see the public site",
]
for item in summary_items:
    story.append(Paragraph(item, s["check"], bulletText="\u2713"))
    story.append(Spacer(1, 2))

# 6. Edge Cases
story.append(Spacer(1, 8))
story.append(Paragraph("6. Handling Edge Cases", s["h1"]))

edge_cases = [
    ("Password-Protected Posts", "Imported as drafts with a note. User decides whether to publish."),
    ("Custom Post Types", "Imported as generic Pages. Future plugin system can add custom type handlers."),
    ("Shortcodes", "Common shortcodes ([gallery], [contact-form-7]) are stripped with a warning. "
     "Content is preserved but the shortcode functionality needs a Parsley plugin equivalent."),
    ("Page Builders (Elementor, Divi)", "Page builder content is stored as complex HTML/JSON. "
     "The importer extracts readable text content and strips builder-specific markup. "
     "A warning is shown that layout may need manual recreation."),
    ("Multilingual (WPML/Polylang)", "Primary language content is imported. Translations are noted "
     "in the import report for manual handling until Parsley adds i18n support."),
    ("Very Large Sites (10K+ posts)", "Batched processing with resume support. If the import "
     "is interrupted, it can continue from where it left off."),
    ("Private/Draft Posts", "Imported with their original status (draft remains draft)."),
    ("REST API Disabled", "Falls back to WXR file upload method. Clear instructions provided."),
    ("Duplicate Slugs", "Auto-appended with a number suffix (e.g., about-2) with a warning."),
]

for title, desc in edge_cases:
    story.append(Paragraph(f"<b>{title}</b>", s["h3"]))
    story.append(Paragraph(desc, s["body_sm"]))
    story.append(Spacer(1, 4))

story.append(PageBreak())

# 7. Post-Migration
story.append(Paragraph("7. Post-Migration Checklist", s["h1"]))
story.append(Paragraph(
    "After import, Parsley shows this checklist to help users complete their migration:",
    s["body"]
))
story.append(Spacer(1, 8))

checklist = [
    ("Review imported pages", "Spot-check 5-10 pages for formatting accuracy"),
    ("Set up redirects", "If changing domains, configure 301 redirects from old URLs"),
    ("Update site settings", "Add logo, favicon, social links, footer text"),
    ("Configure navigation", "Imported menus may need reordering or cleanup"),
    ("Review content hubs", "Check that category-to-hub mapping makes sense"),
    ("Add ANTHROPIC_API_KEY", "Enable the AI Writing Assistant for content improvement"),
    ("Test llms.txt", "Visit /llms.txt to verify AI search optimization is working"),
    ("Update DNS", "Point your domain to Vercel/Parsley when ready to go live"),
    ("Set up analytics", "Add your analytics snippet in Settings"),
    ("Tell AI search engines", "Submit your new sitemap to Google Search Console"),
]

for i, (title, desc) in enumerate(checklist, 1):
    story.append(Paragraph(f"<b>{i}. {title}</b> -- {desc}", s["bullet"], bulletText="\u2610"))
    story.append(Spacer(1, 4))

# ═══════════════════════════════════════════
# PART 2: PLUGIN SYSTEM
# ═══════════════════════════════════════════
story.append(PageBreak())
story.append(Paragraph("Part 2: Plugin System", s["h1"]))
story.append(HRFlowable(width="100%", color=VIOLET, thickness=2))
story.append(Spacer(1, 16))

# 8. Architecture
story.append(Paragraph("8. Plugin Architecture Overview", s["h1"]))
story.append(Paragraph(
    "Parsley's plugin system is designed to be simple for developers and safe for users. "
    "Plugins are npm packages that follow a convention, registered in a single config file. "
    "They can extend admin pages, API routes, editor blocks, public rendering, and AI search outputs.",
    s["body"]
))
story.append(Spacer(1, 10))

story.append(Paragraph("Design Principles", s["h2"]))
principles = [
    ("Convention over configuration", "Plugins follow a predictable file structure. No complex registration APIs."),
    ("Type-safe", "Full TypeScript support with a @parsley/plugin-sdk package providing types and utilities."),
    ("Isolated", "Plugins cannot modify core files. They extend through defined hook points."),
    ("Hot-reloadable", "In development, plugins reload without restarting the dev server."),
    ("Tree-shakeable", "Only the parts of a plugin that are used get bundled in production."),
]
for title, desc in principles:
    story.append(Paragraph(f"<b>{title}</b> -- {desc}", s["bullet"], bulletText="\u2022"))
    story.append(Spacer(1, 3))

# 9. Plugin Structure
story.append(Spacer(1, 8))
story.append(Paragraph("9. Plugin Structure", s["h1"]))
story.append(Paragraph("Registration (parsley.plugins.ts):", s["h3"]))
story.append(Paragraph('import { definePlugins } from "@parsley/core";', s["code"]))
story.append(Paragraph("", s["code"]))
story.append(Paragraph("export default definePlugins([", s["code"]))
story.append(Paragraph('  "@parsley/plugin-contact-form",', s["code"]))
story.append(Paragraph('  "@parsley/plugin-analytics",', s["code"]))
story.append(Paragraph('  "@parsley/plugin-wordpress-import",', s["code"]))
story.append(Paragraph("]);", s["code"]))
story.append(Spacer(1, 10))

story.append(Paragraph("Plugin Package Structure:", s["h3"]))
plugin_structure = [
    "parsley-plugin-contact-form/",
    "  package.json          # name, version, parsley engine version",
    "  index.ts              # Plugin definition (definePlugin())",
    "  admin/",
    "    page.tsx             # Admin page component (/admin/contact-form)",
    "    sidebar-item.ts      # Sidebar nav entry",
    "  api/",
    "    route.ts             # API routes (/api/plugins/contact-form/*)",
    "  editor/",
    "    block.tsx            # Custom editor block (ContactFormBlock)",
    "    toolbar-item.tsx     # Editor toolbar button",
    "  public/",
    "    component.tsx        # Public-facing component",
    "    schema.ts            # JSON-LD schema extension",
    "    llms-section.ts      # llms.txt section extension",
    "  prisma/",
    "    schema.prisma        # Database model extensions",
    "  README.md",
]
for line in plugin_structure:
    story.append(Paragraph(line, s["code"]))

story.append(PageBreak())

# 10. Hooks
story.append(Paragraph("10. Plugin Hooks &amp; Extension Points", s["h1"]))
story.append(Paragraph(
    "Plugins extend Parsley through a defined set of hooks. Each hook has a specific purpose "
    "and receives typed context.",
    s["body"]
))
story.append(Spacer(1, 10))

hooks_data = [
    [Paragraph("<b>Hook</b>", s["th"]), Paragraph("<b>When It Fires</b>", s["th"]),
     Paragraph("<b>Use Case</b>", s["th"])],
    [Paragraph("adminPages", s["td"]), Paragraph("Admin sidebar renders", s["td"]),
     Paragraph("Add new admin pages (e.g., /admin/forms)", s["td"])],
    [Paragraph("apiRoutes", s["td"]), Paragraph("API request received", s["td"]),
     Paragraph("Add custom API endpoints", s["td"])],
    [Paragraph("editorBlocks", s["td"]), Paragraph("Editor initializes", s["td"]),
     Paragraph("Add custom Tiptap extensions/blocks", s["td"])],
    [Paragraph("editorToolbar", s["td"]), Paragraph("Toolbar renders", s["td"]),
     Paragraph("Add buttons to the editor toolbar", s["td"])],
    [Paragraph("publicHead", s["td"]), Paragraph("Public page &lt;head&gt; renders", s["td"]),
     Paragraph("Inject scripts, styles, meta tags", s["td"])],
    [Paragraph("publicFooter", s["td"]), Paragraph("Public page footer renders", s["td"]),
     Paragraph("Add chat widgets, analytics, etc.", s["td"])],
    [Paragraph("schemaOrg", s["td"]), Paragraph("JSON-LD generates", s["td"]),
     Paragraph("Add custom Schema.org types", s["td"])],
    [Paragraph("llmsTxt", s["td"]), Paragraph("llms.txt generates", s["td"]),
     Paragraph("Add sections to llms.txt output", s["td"])],
    [Paragraph("sitemap", s["td"]), Paragraph("sitemap.xml generates", s["td"]),
     Paragraph("Add URLs to the sitemap", s["td"])],
    [Paragraph("rssFeed", s["td"]), Paragraph("feed.xml generates", s["td"]),
     Paragraph("Modify RSS feed entries", s["td"])],
    [Paragraph("onPageCreate", s["td"]), Paragraph("Page created", s["td"]),
     Paragraph("React to content changes (notifications, etc.)", s["td"])],
    [Paragraph("onPagePublish", s["td"]), Paragraph("Page published", s["td"]),
     Paragraph("Auto-share to social media, rebuild cache", s["td"])],
    [Paragraph("onImport", s["td"]), Paragraph("WP import runs", s["td"]),
     Paragraph("Transform imported content (custom post types)", s["td"])],
    [Paragraph("settings", s["td"]), Paragraph("Settings page renders", s["td"]),
     Paragraph("Add plugin-specific settings UI", s["td"])],
    [Paragraph("dashboard", s["td"]), Paragraph("Dashboard renders", s["td"]),
     Paragraph("Add widgets to the admin dashboard", s["td"])],
    [Paragraph("dbSchema", s["td"]), Paragraph("Prisma migration runs", s["td"]),
     Paragraph("Add database tables for plugin data", s["td"])],
]

ht = Table(hooks_data, colWidths=[1.3*inch, 1.8*inch, 3.4*inch])
ht.setStyle(TableStyle([
    ("BACKGROUND", (0,0), (-1,0), VIOLET),
    ("GRID", (0,0), (-1,-1), 0.5, HexColor("#e5e7eb")),
    ("ROWBACKGROUNDS", (0,1), (-1,-1), [WHITE, LIGHT_GRAY]),
    ("TOPPADDING", (0,0), (-1,-1), 4),
    ("BOTTOMPADDING", (0,0), (-1,-1), 4),
    ("LEFTPADDING", (0,0), (-1,-1), 6),
    ("VALIGN", (0,0), (-1,-1), "TOP"),
]))
story.append(ht)

story.append(PageBreak())

# 11. Building First Plugin
story.append(Paragraph("11. Building Your First Plugin", s["h1"]))
story.append(Paragraph(
    "Here's how to build a simple Contact Form plugin step by step.",
    s["body"]
))
story.append(Spacer(1, 10))

story.append(Paragraph("Step 1: Scaffold", s["h2"]))
story.append(Paragraph("npx create-parsley-plugin contact-form", s["code"]))
story.append(Spacer(1, 6))

story.append(Paragraph("Step 2: Define the Plugin (index.ts)", s["h2"]))
code_lines = [
    'import { definePlugin } from "@parsley/plugin-sdk";',
    'import { ContactFormAdmin } from "./admin/page";',
    'import { contactFormApi } from "./api/route";',
    'import { ContactFormBlock } from "./editor/block";',
    "",
    "export default definePlugin({",
    '  name: "contact-form",',
    '  displayName: "Contact Form",',
    '  version: "1.0.0",',
    '  description: "Add contact forms to any page",',
    "",
    "  adminPages: [",
    '    { path: "/admin/contact-form", component: ContactFormAdmin,',
    '      label: "Contact Form", icon: "mail" },',
    "  ],",
    "",
    "  apiRoutes: [",
    '    { path: "/api/plugins/contact-form", handler: contactFormApi },',
    "  ],",
    "",
    "  editorBlocks: [ContactFormBlock],",
    "",
    "  schemaOrg: (page) => {",
    '    if (page.contentType === "CONTACT") {',
    '      return { "@type": "ContactPage", ... };',
    "    }",
    "  },",
    "});",
]
for line in code_lines:
    story.append(Paragraph(line if line else "&nbsp;", s["code"]))

story.append(Spacer(1, 8))
story.append(Paragraph("Step 3: Install &amp; Register", s["h2"]))
story.append(Paragraph("npm install parsley-plugin-contact-form", s["code"]))
story.append(Spacer(1, 4))
story.append(Paragraph("Then add to parsley.plugins.ts and restart the dev server.", s["body_sm"]))

# 12. Plugin Examples
story.append(Spacer(1, 10))
story.append(Paragraph("12. Plugin Ideas &amp; Difficulty", s["h1"]))

plugin_ideas = [
    [Paragraph("<b>Plugin</b>", s["th"]), Paragraph("<b>Difficulty</b>", s["th"]),
     Paragraph("<b>Hooks Used</b>", s["th"]), Paragraph("<b>Description</b>", s["th"])],
    [Paragraph("Contact Form", s["td"]), Paragraph("Easy", s["td"]),
     Paragraph("adminPages, apiRoutes, editorBlocks, schemaOrg", s["td"]),
     Paragraph("Form builder + submissions inbox", s["td"])],
    [Paragraph("Analytics", s["td"]), Paragraph("Easy", s["td"]),
     Paragraph("publicHead, dashboard, settings", s["td"]),
     Paragraph("Privacy-focused analytics dashboard", s["td"])],
    [Paragraph("Newsletter", s["td"]), Paragraph("Medium", s["td"]),
     Paragraph("publicFooter, apiRoutes, settings, onPagePublish", s["td"]),
     Paragraph("Email capture + Resend/Mailchimp", s["td"])],
    [Paragraph("Comments", s["td"]), Paragraph("Medium", s["td"]),
     Paragraph("dbSchema, apiRoutes, publicFooter, adminPages", s["td"]),
     Paragraph("Threaded comments with moderation", s["td"])],
    [Paragraph("E-Commerce", s["td"]), Paragraph("Hard", s["td"]),
     Paragraph("All hooks", s["td"]),
     Paragraph("Products, cart, Stripe checkout", s["td"])],
    [Paragraph("Social Share", s["td"]), Paragraph("Easy", s["td"]),
     Paragraph("onPagePublish, settings", s["td"]),
     Paragraph("Auto-post to Twitter/LinkedIn", s["td"])],
    [Paragraph("WP Importer", s["td"]), Paragraph("Medium", s["td"]),
     Paragraph("adminPages, apiRoutes, onImport", s["td"]),
     Paragraph("One-click WordPress migration", s["td"])],
    [Paragraph("3D Catalog", s["td"]), Paragraph("Medium", s["td"]),
     Paragraph("editorBlocks, adminPages, schemaOrg", s["td"]),
     Paragraph("GLB upload + AR Quick Look", s["td"])],
    [Paragraph("Multi-language", s["td"]), Paragraph("Hard", s["td"]),
     Paragraph("dbSchema, adminPages, publicHead, llmsTxt", s["td"]),
     Paragraph("i18n with per-language pages", s["td"])],
]

pit = Table(plugin_ideas, colWidths=[1.2*inch, 0.8*inch, 2.5*inch, 2.0*inch])
pit.setStyle(TableStyle([
    ("BACKGROUND", (0,0), (-1,0), VIOLET),
    ("GRID", (0,0), (-1,-1), 0.5, HexColor("#e5e7eb")),
    ("ROWBACKGROUNDS", (0,1), (-1,-1), [WHITE, LIGHT_GRAY]),
    ("TOPPADDING", (0,0), (-1,-1), 5),
    ("BOTTOMPADDING", (0,0), (-1,-1), 5),
    ("LEFTPADDING", (0,0), (-1,-1), 6),
    ("VALIGN", (0,0), (-1,-1), "TOP"),
]))
story.append(pit)

# 13. Distribution
story.append(Spacer(1, 12))
story.append(Paragraph("13. Plugin Distribution", s["h1"]))

story.append(Paragraph("npm Registry (Primary)", s["h2"]))
story.append(Paragraph(
    "Plugins are published to npm with a 'parsley-plugin-' prefix. Users install with "
    "npm install and register in parsley.plugins.ts. This is the recommended distribution method.",
    s["body"]
))
story.append(Spacer(1, 8))

story.append(Paragraph("Parsley Plugin Marketplace (Future)", s["h2"]))
story.append(Paragraph(
    "A curated directory at plugins.parsley.dev where developers can list their plugins. "
    "Features include: verified badges, install counts, ratings, one-click install from admin panel, "
    "and revenue sharing for premium plugins. Agencies can sell templates and plugins here.",
    s["body"]
))
story.append(Spacer(1, 8))

story.append(Paragraph("Local Plugins", s["h2"]))
story.append(Paragraph(
    "For site-specific functionality, plugins can live in a /plugins directory in the project root "
    "without being published to npm. Registered the same way in parsley.plugins.ts but imported "
    "with a relative path.",
    s["body"]
))

# ─── FOOTER ───
story.append(Spacer(1, 30))
story.append(HRFlowable(width="100%", color=GREEN, thickness=2))
story.append(Spacer(1, 10))
story.append(Paragraph("Parsley CMS -- Built for the AI search era", s["footer"]))
story.append(Paragraph("https://parsley.dev | github.com/Neilaj/parsley", s["footer"]))

doc.build(story)
print(f"PDF generated: {OUTPUT}")
