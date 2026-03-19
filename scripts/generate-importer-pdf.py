#!/usr/bin/env python3
"""Generate the Parsley WordPress Importer Guide PDF."""

from reportlab.lib.pagesizes import letter
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.colors import HexColor
from reportlab.lib.units import inch
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, PageBreak,
    Table, TableStyle, ListFlowable, ListItem, HRFlowable
)
from reportlab.lib.enums import TA_CENTER, TA_LEFT

OUTPUT_PATH = "/Users/neilajodah/Desktop/parsley/public/docs/parsley-wordpress-importer-guide.pdf"

GREEN = HexColor("#16a34a")
DARK_GREEN = HexColor("#15803d")
DARK = HexColor("#111827")
GRAY = HexColor("#6b7280")
LIGHT_BG = HexColor("#f0fdf4")
YELLOW_BG = HexColor("#fefce8")
RED_BG = HexColor("#fef2f2")

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

    # Custom styles
    styles.add(ParagraphStyle(
        "DocTitle", parent=styles["Title"],
        fontSize=26, textColor=DARK, spaceAfter=6,
        fontName="Helvetica-Bold",
    ))
    styles.add(ParagraphStyle(
        "Subtitle", parent=styles["Normal"],
        fontSize=12, textColor=GRAY, spaceAfter=24,
        alignment=TA_CENTER,
    ))
    styles.add(ParagraphStyle(
        "H1", parent=styles["Heading1"],
        fontSize=20, textColor=GREEN, spaceBefore=24, spaceAfter=10,
        fontName="Helvetica-Bold",
    ))
    styles.add(ParagraphStyle(
        "H2", parent=styles["Heading2"],
        fontSize=15, textColor=DARK, spaceBefore=18, spaceAfter=8,
        fontName="Helvetica-Bold",
    ))
    styles.add(ParagraphStyle(
        "H3", parent=styles["Heading3"],
        fontSize=12, textColor=DARK_GREEN, spaceBefore=14, spaceAfter=6,
        fontName="Helvetica-Bold",
    ))
    styles.add(ParagraphStyle(
        "Body", parent=styles["Normal"],
        fontSize=10, textColor=DARK, spaceAfter=8, leading=15,
    ))
    styles.add(ParagraphStyle(
        "BulletCustom", parent=styles["Normal"],
        fontSize=10, textColor=DARK, spaceAfter=4, leading=14,
        leftIndent=20, bulletIndent=8,
    ))
    styles.add(ParagraphStyle(
        "CodeCustom", parent=styles["Normal"],
        fontSize=9, textColor=HexColor("#1e40af"), spaceAfter=4, leading=13,
        fontName="Courier", leftIndent=20,
    ))
    styles.add(ParagraphStyle(
        "TableCell", parent=styles["Normal"],
        fontSize=9, textColor=DARK, leading=12,
    ))
    styles.add(ParagraphStyle(
        "TableHeader", parent=styles["Normal"],
        fontSize=9, textColor=HexColor("#ffffff"), leading=12,
        fontName="Helvetica-Bold",
    ))
    styles.add(ParagraphStyle(
        "Footer", parent=styles["Normal"],
        fontSize=8, textColor=GRAY, alignment=TA_CENTER,
    ))

    story = []

    # ─── Title Page ────────────────────────────────────
    story.append(Spacer(1, 1.5*inch))
    story.append(Paragraph("Parsley CMS", styles["DocTitle"]))
    story.append(Paragraph("WordPress Import System Guide", ParagraphStyle(
        "TitleSub", parent=styles["Title"], fontSize=18, textColor=GREEN,
        spaceAfter=12, fontName="Helvetica",
    )))
    story.append(Spacer(1, 12))
    story.append(HRFlowable(width="40%", thickness=2, color=GREEN))
    story.append(Spacer(1, 12))
    story.append(Paragraph("Migrate your WordPress site to Parsley in minutes.<br/>Automatic AI search optimization included.", styles["Subtitle"]))
    story.append(Spacer(1, 2*inch))
    story.append(Paragraph("Version 1.0 | March 2026", styles["Footer"]))
    story.append(Paragraph("https://parsley.dev", styles["Footer"]))
    story.append(PageBreak())

    # ─── Overview ──────────────────────────────────────
    story.append(Paragraph("Overview", styles["H1"]))
    story.append(Paragraph(
        "The Parsley WordPress Importer is a built-in migration tool that lets users move their "
        "entire WordPress site to Parsley in minutes. It connects to any WordPress site via the "
        "WP REST API, scans all content, and imports pages, posts, media, categories, and menus "
        "- automatically converting them into Parsley's AI-optimized structure.",
        styles["Body"]
    ))
    story.append(Paragraph(
        "Unlike other migration tools, Parsley's importer doesn't just copy content - it <b>upgrades</b> it. "
        "WordPress categories become Content Hubs with Schema.org structured data. Posts get proper content "
        "type assignments. And everything is automatically optimized for AI search engines from day one.",
        styles["Body"]
    ))

    # ─── How It Works ──────────────────────────────────
    story.append(Paragraph("How It Works - Step by Step", styles["H1"]))

    # Step 1
    story.append(Paragraph("Step 1: Connect", styles["H2"]))
    bullets = [
        "Navigate to <b>/admin/import</b> in your Parsley dashboard",
        "Enter your WordPress site URL (e.g., https://mysite.com)",
        "Optionally provide Application Password credentials for accessing draft/private content",
        'Click "Connect &amp; Scan" - Parsley calls the WordPress REST API to discover all content',
    ]
    for b in bullets:
        story.append(Paragraph(f"<bullet>&bull;</bullet> {b}", styles["BulletCustom"]))

    # Step 2
    story.append(Paragraph("Step 2: Review &amp; Configure", styles["H2"]))
    story.append(Paragraph("After scanning, you'll see:", styles["Body"]))
    bullets = [
        "<b>Content counts</b>: Total posts, pages, and media files found",
        "<b>Checkboxes</b> to select what to import (posts, pages, media)",
        "<b>Staging Mode toggle</b>: When enabled, ALL content imports as drafts first - nothing goes live until you review and approve",
        "<b>Category to Hub Mapping</b>: WordPress categories are automatically suggested as Parsley Content Hubs. This is the key AI optimization step - it transforms flat WordPress categories into structured topic clusters.",
    ]
    for b in bullets:
        story.append(Paragraph(f"<bullet>&bull;</bullet> {b}", styles["BulletCustom"]))

    # Step 3
    story.append(Paragraph("Step 3: Preview &amp; Select", styles["H2"]))
    bullets = [
        "See every individual page/post that will be imported",
        "Each item shows: title, slug, content type, hub assignment, and status",
        "<b>Change content types</b> per item - the importer auto-guesses types (Article, FAQ, Service, Landing, etc.) based on slugs, but you can override",
        "<b>Select/deselect individual items</b> - import only what you need",
    ]
    for b in bullets:
        story.append(Paragraph(f"<bullet>&bull;</bullet> {b}", styles["BulletCustom"]))

    # Step 4
    story.append(Paragraph("Step 4: Import", styles["H2"]))
    story.append(Paragraph("Behind the scenes, Parsley:", styles["Body"]))
    steps = [
        "Creates Content Hubs from your selected categories",
        "Fetches full content for each page/post via WP REST API",
        "Converts WordPress HTML (including Gutenberg blocks) to Tiptap JSON",
        "Creates Parsley pages with proper content types, slugs, excerpts, and hub assignments",
        "Imports media references (images remain hosted on WP server initially)",
        "Creates an ImportHistory record tracking everything",
    ]
    for i, s in enumerate(steps, 1):
        story.append(Paragraph(f"<bullet>{i}.</bullet> {s}", styles["BulletCustom"]))

    # Step 5
    story.append(Paragraph("Step 5: Complete", styles["H2"]))
    bullets = [
        "Full report showing: imported count, skipped count, hubs created, media imported",
        "List of any errors or skipped items with explanations",
        "Next steps guidance: review pages, check hubs, assign pillar pages, set up redirects",
    ]
    for b in bullets:
        story.append(Paragraph(f"<bullet>&bull;</bullet> {b}", styles["BulletCustom"]))

    story.append(PageBreak())

    # ─── Content Conversion ────────────────────────────
    story.append(Paragraph("Content Conversion", styles["H1"]))

    story.append(Paragraph("HTML to Tiptap JSON", styles["H2"]))
    story.append(Paragraph(
        "WordPress content (both Classic Editor and Gutenberg blocks) is converted to Tiptap's JSON format:",
        styles["Body"]
    ))

    conv_data = [
        ["WordPress Element", "Tiptap Node"],
        ["Headings (H1-H6)", "heading nodes with level"],
        ["Paragraphs", "paragraph nodes"],
        ["Bold, italic, links", "Tiptap marks"],
        ["Unordered lists", "bulletList nodes"],
        ["Ordered lists", "orderedList nodes"],
        ["Blockquotes", "blockquote nodes"],
        ["Code blocks", "codeBlock nodes"],
        ["Images", "image nodes (src + alt)"],
        ["Horizontal rules", "horizontalRule nodes"],
        ["WP block comments", "Automatically stripped"],
    ]
    conv_table = Table(conv_data, colWidths=[2.8*inch, 3.2*inch])
    conv_table.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, 0), GREEN),
        ("TEXTCOLOR", (0, 0), (-1, 0), HexColor("#ffffff")),
        ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
        ("FONTSIZE", (0, 0), (-1, -1), 9),
        ("ALIGN", (0, 0), (-1, -1), "LEFT"),
        ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
        ("GRID", (0, 0), (-1, -1), 0.5, HexColor("#e5e7eb")),
        ("ROWBACKGROUNDS", (0, 1), (-1, -1), [HexColor("#ffffff"), HexColor("#f9fafb")]),
        ("TOPPADDING", (0, 0), (-1, -1), 6),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 6),
        ("LEFTPADDING", (0, 0), (-1, -1), 8),
    ]))
    story.append(conv_table)
    story.append(Spacer(1, 12))

    story.append(Paragraph("Content Type Auto-Detection", styles["H2"]))
    story.append(Paragraph(
        "The importer intelligently guesses content types based on page slugs and titles:",
        styles["Body"]
    ))

    type_data = [
        ["Slug/Title Contains", "Content Type"],
        ['"about", "story"', "PAGE"],
        ['"contact"', "CONTACT"],
        ['"service", "what-we-do"', "SERVICE"],
        ['"faq", "question"', "FAQ"],
        ['"portfolio", "work", "project"', "PORTFOLIO"],
        ['"product", "shop"', "PRODUCT"],
        ['"home", "landing"', "LANDING"],
        ["All WordPress posts", "ARTICLE"],
        ["Default fallback", "PAGE"],
    ]
    type_table = Table(type_data, colWidths=[3*inch, 3*inch])
    type_table.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, 0), GREEN),
        ("TEXTCOLOR", (0, 0), (-1, 0), HexColor("#ffffff")),
        ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
        ("FONTSIZE", (0, 0), (-1, -1), 9),
        ("GRID", (0, 0), (-1, -1), 0.5, HexColor("#e5e7eb")),
        ("ROWBACKGROUNDS", (0, 1), (-1, -1), [HexColor("#ffffff"), HexColor("#f9fafb")]),
        ("TOPPADDING", (0, 0), (-1, -1), 6),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 6),
        ("LEFTPADDING", (0, 0), (-1, -1), 8),
    ]))
    story.append(type_table)

    story.append(PageBreak())

    # ─── Category to Hub Mapping ───────────────────────
    story.append(Paragraph("Category to Hub Mapping", styles["H1"]))
    story.append(Paragraph(
        "This is the most important part of the import for AI search optimization:",
        styles["Body"]
    ))
    steps = [
        "The importer reads all WordPress categories",
        "Categories with content (count > 0) are suggested as Content Hubs",
        "Each hub gets a name, slug, and description",
        "All posts in that WP category are automatically assigned to the corresponding hub",
    ]
    for i, s in enumerate(steps, 1):
        story.append(Paragraph(f"<bullet>{i}.</bullet> {s}", styles["BulletCustom"]))

    story.append(Spacer(1, 8))
    story.append(Paragraph("Once imported, the hub system provides:", styles["Body"]))
    hub_benefits = [
        "Auto-generated Schema.org CollectionPage + ItemList JSON-LD",
        "Hub landing pages at /hub/[slug]",
        "Breadcrumb navigation on spoke pages",
        '"Related in this hub" internal links',
        "llms.txt grouping by topic",
    ]
    for b in hub_benefits:
        story.append(Paragraph(f"<bullet>&bull;</bullet> {b}", styles["BulletCustom"]))

    # ─── Safety Features ───────────────────────────────
    story.append(Paragraph("Safety Features", styles["H1"]))

    story.append(Paragraph("Import History", styles["H2"]))
    story.append(Paragraph("Every import is recorded in the database with:", styles["Body"]))
    history_items = [
        "Source (WordPress), source URL, source site name",
        "Status: COMPLETED, PARTIAL, or ROLLED_BACK",
        "Stats: total items, imported count, skipped count, media count",
        "Full detailed report as JSON",
        "List of hub IDs created during the import",
        "Link to all pages created by this import batch",
    ]
    for b in history_items:
        story.append(Paragraph(f"<bullet>&bull;</bullet> {b}", styles["BulletCustom"]))
    story.append(Paragraph('Access import history from the "History" tab on /admin/import.', styles["Body"]))

    story.append(Paragraph("Rollback", styles["H2"]))
    story.append(Paragraph("Every import can be completely undone:", styles["Body"]))
    rollback_items = [
        'Click "Rollback" on any completed import in the History tab',
        "Parsley deletes ALL pages created by that specific import",
        "Hubs created during the import are also deleted (only if they have no pages from other sources)",
        'The import is marked as "Rolled Back" in history',
        "Other imports and manually created content are never affected",
    ]
    for b in rollback_items:
        story.append(Paragraph(f"<bullet>&bull;</bullet> {b}", styles["BulletCustom"]))

    story.append(Paragraph("Staging Mode", styles["H2"]))
    story.append(Paragraph("For large or important sites, staging mode provides an extra safety layer:", styles["Body"]))
    staging_items = [
        'Toggle "Staging Mode" ON before importing',
        "ALL content imports as DRAFT regardless of its WordPress publish status",
        "Review every page in /admin/pages before anything goes live",
        'When ready, click "Publish All" in the History tab to bulk-publish',
        "Or selectively publish individual pages from the editor",
    ]
    for b in staging_items:
        story.append(Paragraph(f"<bullet>&bull;</bullet> {b}", styles["BulletCustom"]))

    story.append(Paragraph("Conflict Detection", styles["H2"]))
    conflict_items = [
        "If a page slug already exists in Parsley, the import SKIPS that item",
        "Skipped items are reported with the reason",
        "This prevents accidental overwrites of existing content",
    ]
    for b in conflict_items:
        story.append(Paragraph(f"<bullet>&bull;</bullet> {b}", styles["BulletCustom"]))

    story.append(PageBreak())

    # ─── Authentication ────────────────────────────────
    story.append(Paragraph("Authentication", styles["H1"]))

    story.append(Paragraph("Public Content (No Auth Required)", styles["H2"]))
    story.append(Paragraph(
        "By default, the importer reads publicly available content via the WP REST API:",
        styles["Body"]
    ))
    pub_items = [
        "Published posts and pages",
        "Categories and tags",
        "Public media files",
    ]
    for b in pub_items:
        story.append(Paragraph(f"<bullet>&bull;</bullet> {b}", styles["BulletCustom"]))

    story.append(Paragraph("Private Content (Application Password Required)", styles["H2"]))
    story.append(Paragraph("To import draft posts, private pages, or password-protected content:", styles["Body"]))
    auth_steps = [
        "In WordPress: Go to Users > Profile > Application Passwords",
        "Create a new Application Password",
        "In Parsley: Enter your WP username and the generated Application Password",
        "The importer will use HTTP Basic Auth to access private content",
    ]
    for i, s in enumerate(auth_steps, 1):
        story.append(Paragraph(f"<bullet>{i}.</bullet> {s}", styles["BulletCustom"]))

    # ─── Media Handling ────────────────────────────────
    story.append(Paragraph("Media Handling", styles["H1"]))
    media_items = [
        "Media references (URLs) are imported into Parsley's media library",
        "Images remain hosted on the WordPress server initially",
        "This means images will continue to work as long as the WP site is online",
        "To fully migrate media, re-upload images through Parsley's media library later",
        "Featured images are preserved as OG images on the corresponding pages",
    ]
    for b in media_items:
        story.append(Paragraph(f"<bullet>&bull;</bullet> {b}", styles["BulletCustom"]))

    # ─── Technical Architecture ────────────────────────
    story.append(Paragraph("Technical Architecture", styles["H1"]))

    story.append(Paragraph("API Routes", styles["H2"]))
    api_data = [
        ["Route", "Method", "Purpose"],
        ["/api/import/wordpress", "POST", "Scan and preview (actions: scan, preview)"],
        ["/api/import/wordpress/execute", "POST", "Execute the import"],
        ["/api/import/history", "GET", "List all past imports"],
        ["/api/import/rollback", "POST", "Undo a specific import"],
        ["/api/import/publish", "POST", "Bulk-publish staged imports"],
    ]
    api_table = Table(api_data, colWidths=[2.3*inch, 0.7*inch, 3*inch])
    api_table.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, 0), GREEN),
        ("TEXTCOLOR", (0, 0), (-1, 0), HexColor("#ffffff")),
        ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
        ("FONTNAME", (0, 1), (0, -1), "Courier"),
        ("FONTSIZE", (0, 0), (-1, -1), 8),
        ("GRID", (0, 0), (-1, -1), 0.5, HexColor("#e5e7eb")),
        ("ROWBACKGROUNDS", (0, 1), (-1, -1), [HexColor("#ffffff"), HexColor("#f9fafb")]),
        ("TOPPADDING", (0, 0), (-1, -1), 5),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 5),
        ("LEFTPADDING", (0, 0), (-1, -1), 6),
    ]))
    story.append(api_table)
    story.append(Spacer(1, 12))

    story.append(Paragraph("Database Models", styles["H2"]))
    db_items = [
        "<b>ImportHistory</b> - Tracks each import with stats, status, and report",
        "<b>Page.importBatchId</b> - Links each imported page to its ImportHistory record",
        "<b>ImportHistory.hubIds</b> - Tracks which hubs were created for rollback",
    ]
    for b in db_items:
        story.append(Paragraph(f"<bullet>&bull;</bullet> {b}", styles["BulletCustom"]))

    story.append(Paragraph("Data Flow", styles["H2"]))
    flow_steps = [
        "User enters WP URL -> /api/import/wordpress (action: scan)",
        "API calls WP REST API endpoints: /wp-json/wp/v2/posts, pages, categories, tags, media",
        "Returns content counts and category suggestions",
        "User configures options -> /api/import/wordpress (action: preview)",
        "API fetches all content with _embed for featured images",
        "Returns preview items with auto-detected content types",
        "User confirms -> /api/import/wordpress/execute",
        "API creates ImportHistory record, creates hubs, imports pages, imports media",
        "Updates ImportHistory with final stats and report",
        "Returns success with full report",
    ]
    for i, s in enumerate(flow_steps, 1):
        story.append(Paragraph(f"<bullet>{i}.</bullet> {s}", styles["BulletCustom"]))

    story.append(PageBreak())

    # ─── Limitations ───────────────────────────────────
    story.append(Paragraph("Limitations", styles["H1"]))
    limits = [
        "WordPress multisite is not currently supported",
        "Custom post types beyond posts and pages are not imported",
        "WordPress shortcodes are stripped (not converted)",
        "Complex Gutenberg blocks (galleries, columns, embeds) are simplified to basic HTML",
        "WooCommerce products require the e-commerce plugin (future)",
        "Maximum 500 media items per import to prevent timeouts",
    ]
    for b in limits:
        story.append(Paragraph(f"<bullet>&bull;</bullet> {b}", styles["BulletCustom"]))

    # ─── Footer ────────────────────────────────────────
    story.append(Spacer(1, 1*inch))
    story.append(HRFlowable(width="100%", thickness=1, color=HexColor("#e5e7eb")))
    story.append(Spacer(1, 8))
    story.append(Paragraph("Parsley CMS - Built for the AI search era.", styles["Footer"]))
    story.append(Paragraph("https://parsley.dev", styles["Footer"]))

    doc.build(story)
    print(f"PDF generated: {OUTPUT_PATH}")

if __name__ == "__main__":
    build_pdf()
