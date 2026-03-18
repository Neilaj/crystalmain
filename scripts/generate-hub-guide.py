#!/usr/bin/env python3
"""Generate the Parsley Hub System Guide PDF"""

from reportlab.lib.pagesizes import letter
from reportlab.lib.units import inch
from reportlab.lib.colors import HexColor
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib.enums import TA_LEFT, TA_CENTER
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle,
    PageBreak, HRFlowable
)

# Colors
GREEN = HexColor("#16a34a")
DARK_GREEN = HexColor("#15803d")
DARK = HexColor("#111827")
GRAY = HexColor("#6b7280")
LIGHT_GRAY = HexColor("#f3f4f6")
BLUE = HexColor("#2563eb")
BLUE_BG = HexColor("#eff6ff")
WHITE = HexColor("#ffffff")

OUTPUT = "/Users/neilajodah/Desktop/parsley/public/docs/parsley-hub-system-guide.pdf"

doc = SimpleDocTemplate(
    OUTPUT,
    pagesize=letter,
    leftMargin=0.75*inch,
    rightMargin=0.75*inch,
    topMargin=0.75*inch,
    bottomMargin=0.75*inch,
)

# Styles
styles = {
    "cover_title": ParagraphStyle("cover_title", fontSize=36, leading=42, textColor=DARK, fontName="Helvetica-Bold", alignment=TA_CENTER),
    "cover_sub": ParagraphStyle("cover_sub", fontSize=16, leading=22, textColor=GREEN, fontName="Helvetica", alignment=TA_CENTER),
    "cover_desc": ParagraphStyle("cover_desc", fontSize=12, leading=18, textColor=GRAY, fontName="Helvetica", alignment=TA_CENTER),
    "h1": ParagraphStyle("h1", fontSize=24, leading=30, textColor=DARK, fontName="Helvetica-Bold", spaceBefore=24, spaceAfter=12),
    "h2": ParagraphStyle("h2", fontSize=18, leading=24, textColor=DARK_GREEN, fontName="Helvetica-Bold", spaceBefore=20, spaceAfter=8),
    "h3": ParagraphStyle("h3", fontSize=14, leading=18, textColor=DARK, fontName="Helvetica-Bold", spaceBefore=14, spaceAfter=6),
    "body": ParagraphStyle("body", fontSize=11, leading=16, textColor=DARK, fontName="Helvetica"),
    "body_gray": ParagraphStyle("body_gray", fontSize=11, leading=16, textColor=GRAY, fontName="Helvetica"),
    "bullet": ParagraphStyle("bullet", fontSize=11, leading=16, textColor=DARK, fontName="Helvetica", leftIndent=20, bulletIndent=8),
    "numbered": ParagraphStyle("numbered", fontSize=11, leading=16, textColor=DARK, fontName="Helvetica", leftIndent=20, bulletIndent=8),
    "code": ParagraphStyle("code", fontSize=9, leading=13, textColor=DARK, fontName="Courier", backColor=LIGHT_GRAY, leftIndent=12, rightIndent=12, spaceBefore=6, spaceAfter=6),
    "tip": ParagraphStyle("tip", fontSize=10, leading=15, textColor=HexColor("#1e40af"), fontName="Helvetica", backColor=BLUE_BG, leftIndent=12, rightIndent=12, spaceBefore=4, spaceAfter=4),
    "footer": ParagraphStyle("footer", fontSize=9, leading=12, textColor=GRAY, fontName="Helvetica", alignment=TA_CENTER),
    "table_header": ParagraphStyle("table_header", fontSize=10, leading=14, textColor=WHITE, fontName="Helvetica-Bold"),
    "table_cell": ParagraphStyle("table_cell", fontSize=10, leading=14, textColor=DARK, fontName="Helvetica"),
}

story = []

# ─── COVER PAGE ───
story.append(Spacer(1, 2*inch))
story.append(Paragraph("Parsley CMS", styles["cover_title"]))
story.append(Spacer(1, 12))
story.append(Paragraph("Content Hub System Guide", styles["cover_sub"]))
story.append(Spacer(1, 24))
story.append(Paragraph("How to organize your content into topic clusters<br/>for maximum AI search engine visibility", styles["cover_desc"]))
story.append(Spacer(1, 48))
story.append(HRFlowable(width="40%", color=GREEN, thickness=2))
story.append(Spacer(1, 12))
story.append(Paragraph("Built for the AI search era", styles["footer"]))
story.append(PageBreak())

# ─── TABLE OF CONTENTS ───
story.append(Paragraph("Table of Contents", styles["h1"]))
story.append(Spacer(1, 12))
toc_items = [
    "1. What is a Content Hub?",
    "2. Why Hubs Matter for AI Search (AEO)",
    "3. How to Create a Hub in Parsley",
    "4. Hub Architecture",
    "5. What AI Search Engines See",
    "6. Best Practices",
    "7. Parsley vs WordPress Comparison",
]
for item in toc_items:
    story.append(Paragraph(item, styles["body"]))
    story.append(Spacer(1, 6))
story.append(PageBreak())

# ─── SECTION 1: WHAT IS A CONTENT HUB? ───
story.append(Paragraph("1. What is a Content Hub?", styles["h1"]))
story.append(Paragraph(
    "A Content Hub is a topic cluster strategy that organizes your website's pages into "
    "interconnected groups. It's the most effective way to demonstrate topical authority to "
    "both traditional search engines and AI search engines.",
    styles["body"]
))
story.append(Spacer(1, 12))

story.append(Paragraph("A hub consists of three parts:", styles["body"]))
story.append(Spacer(1, 8))
story.append(Paragraph("<b>Hub</b> - The overarching topic (e.g., 'Web Design', 'Digital Marketing')", styles["bullet"], bulletText="\u2022"))
story.append(Paragraph("<b>Pillar Page</b> - The main comprehensive guide for the topic. This is your most authoritative piece of content.", styles["bullet"], bulletText="\u2022"))
story.append(Paragraph("<b>Spoke Pages</b> - Related articles that dive deep into subtopics, all linking back to the pillar.", styles["bullet"], bulletText="\u2022"))
story.append(Spacer(1, 12))

story.append(Paragraph(
    "Think of it like a wheel: the hub is the center, the pillar page is the axle, "
    "and the spoke pages radiate outward. AI search engines love this structure because "
    "it clearly signals expertise and topical depth.",
    styles["body_gray"]
))

# ─── SECTION 2: WHY HUBS MATTER ───
story.append(Spacer(1, 8))
story.append(Paragraph("2. Why Hubs Matter for AI Search (AEO)", styles["h1"]))
story.append(Paragraph(
    "AI Engine Optimization (AEO) is the practice of making your content visible and citable "
    "by AI search engines like ChatGPT, Perplexity, Claude, and Google AI Overviews. "
    "Content Hubs are the foundation of effective AEO.",
    styles["body"]
))
story.append(Spacer(1, 12))

reasons = [
    ("<b>Topical Authority</b> - AI search engines prioritize sites that cover topics comprehensively. A hub with 10 well-written spoke pages signals deep expertise.", None),
    ("<b>Clear Structure</b> - Schema.org structured data (CollectionPage, ItemList, BreadcrumbList) tells AI crawlers exactly how your content is organized.", None),
    ("<b>llms.txt Roadmap</b> - Parsley's llms.txt file groups content by hub, giving AI a direct roadmap of your site's expertise areas.", None),
    ("<b>Internal Linking</b> - Automatic links between hub and spoke pages strengthen topical signals and help crawlers discover all related content.", None),
    ("<b>Citation Readiness</b> - When AI needs to cite a source on 'web design', it looks for sites with comprehensive, well-structured coverage. That's what hubs provide.", None),
]

for reason, _ in reasons:
    story.append(Paragraph(reason, styles["bullet"], bulletText="\u2022"))
    story.append(Spacer(1, 4))

story.append(PageBreak())

# ─── SECTION 3: HOW TO CREATE A HUB ───
story.append(Paragraph("3. How to Create a Hub in Parsley", styles["h1"]))

story.append(Paragraph("Step 1: Create the Hub", styles["h2"]))
steps1 = [
    "Go to <b>/admin/hubs</b> in your Parsley dashboard",
    'Click "<b>+ New Hub</b>"',
    'Enter a name (e.g., "Web Design")',
    "Add a description explaining what the topic covers",
    "Optionally select a <b>Pillar Page</b> (your main guide for this topic)",
    "Fill in SEO meta title and description",
    'Click "<b>Create Hub</b>"',
]
for i, step in enumerate(steps1, 1):
    story.append(Paragraph(step, styles["numbered"], bulletText=f"{i}."))
    story.append(Spacer(1, 3))

story.append(Spacer(1, 8))
story.append(Paragraph("Step 2: Assign Spoke Pages", styles["h2"]))
steps2 = [
    "Go to <b>/admin/pages</b> and edit any page",
    'In the sidebar, find the "<b>Content Hub</b>" dropdown',
    "Select the hub this page belongs to",
    "Save the page",
    "Repeat for all related pages",
]
for i, step in enumerate(steps2, 1):
    story.append(Paragraph(step, styles["numbered"], bulletText=f"{i}."))
    story.append(Spacer(1, 3))

story.append(Spacer(1, 8))
story.append(Paragraph("Step 3: Automatic Optimization", styles["h2"]))
story.append(Paragraph("Once pages are assigned to a hub, Parsley automatically:", styles["body"]))
story.append(Spacer(1, 6))

auto_features = [
    "Creates a hub landing page at <b>/hub/[slug]</b> listing all spoke pages",
    "Adds <b>breadcrumb navigation</b> on spoke pages (Home > Hub > Page)",
    'Shows "<b>Related in this hub</b>" links at the bottom of spoke pages',
    "Generates <b>Schema.org CollectionPage + ItemList</b> JSON-LD on the hub page",
    "Adds <b>BreadcrumbList + isPartOf</b> schema on spoke pages",
    "Updates <b>llms.txt</b> with Topic Hubs section grouping all hub content",
    "Adds hub pages to <b>sitemap.xml</b> with priority 0.8",
]
for feature in auto_features:
    story.append(Paragraph(feature, styles["bullet"], bulletText="\u2713"))
    story.append(Spacer(1, 3))

story.append(PageBreak())

# ─── SECTION 4: ARCHITECTURE ───
story.append(Paragraph("4. Hub Architecture", styles["h1"]))
story.append(Paragraph(
    "The diagram below shows how a content hub is structured. The hub is the topic container, "
    "the pillar page is the comprehensive guide, and spoke pages are the supporting articles.",
    styles["body"]
))
story.append(Spacer(1, 16))

# Architecture diagram as a table
arch_data = [
    ["", "", Paragraph('<b>HUB</b><br/>"Web Design"<br/>/hub/web-design', styles["table_cell"]), "", ""],
    ["", "", Paragraph("\u2502", styles["table_cell"]), "", ""],
    [
        Paragraph('<b>PILLAR</b><br/>"Complete Guide<br/>to Web Design"', styles["table_cell"]),
        Paragraph("\u2190\u2500\u2500\u2500", styles["table_cell"]),
        Paragraph("\u253C", styles["table_cell"]),
        Paragraph("\u2500\u2500\u2500\u2192", styles["table_cell"]),
        Paragraph('<b>SPOKE</b><br/>"Best Fonts<br/>for Web"', styles["table_cell"]),
    ],
    ["", "", Paragraph("\u2502", styles["table_cell"]), "", ""],
    ["", "", Paragraph('<b>SPOKE</b><br/>"Page Speed<br/>Guide"', styles["table_cell"]), "", ""],
]

arch_table = Table(arch_data, colWidths=[1.5*inch, 0.7*inch, 1.5*inch, 0.7*inch, 1.5*inch])
arch_table.setStyle(TableStyle([
    ("ALIGN", (0, 0), (-1, -1), "CENTER"),
    ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
    ("BOX", (0, 0), (0, 0), 1, GREEN),
    ("BOX", (4, 2), (4, 2), 1, GREEN),
    ("BOX", (2, 0), (2, 0), 1, GREEN),
    ("BOX", (2, 4), (2, 4), 1, GREEN),
    ("BACKGROUND", (2, 0), (2, 0), HexColor("#f0fdf4")),
    ("BACKGROUND", (0, 2), (0, 2), HexColor("#fef3c7")),
    ("BACKGROUND", (4, 2), (4, 2), HexColor("#fef3c7")),
    ("BACKGROUND", (2, 4), (2, 4), HexColor("#fef3c7")),
]))
story.append(arch_table)
story.append(Spacer(1, 16))

story.append(Paragraph(
    "Each arrow represents an automatic internal link. The pillar page links to all spokes, "
    "all spokes link back to the hub landing page, and the hub page lists everything.",
    styles["body_gray"]
))

# ─── SECTION 5: WHAT AI SEES ───
story.append(Spacer(1, 8))
story.append(Paragraph("5. What AI Search Engines See", styles["h1"]))

story.append(Paragraph("llms.txt Output", styles["h2"]))
story.append(Paragraph(
    "When an AI crawler visits your /llms.txt, it sees your hubs clearly organized:",
    styles["body"]
))
story.append(Spacer(1, 8))

llms_lines = [
    "## Topic Hubs",
    "",
    "### Web Design",
    "A comprehensive collection of guides about modern web design.",
    "",
    "- Hub page: [Web Design](https://yoursite.com/hub/web-design)",
    "- Pillar: [Complete Guide to Web Design](https://yoursite.com/...)",
    "- Related articles (3):",
    "  - [Best Fonts for Web]: A guide to typography...",
    "  - [Page Speed Guide]: How to optimize performance...",
    "  - [Responsive Design Tips]: Making sites work everywhere...",
]
for line in llms_lines:
    story.append(Paragraph(line if line else "&nbsp;", styles["code"]))

story.append(Spacer(1, 12))
story.append(Paragraph("Schema.org JSON-LD (on hub pages)", styles["h2"]))
story.append(Paragraph(
    "Parsley automatically generates rich structured data that AI crawlers parse:",
    styles["body"]
))
story.append(Spacer(1, 8))

schema_lines = [
    '{ "@type": "CollectionPage",',
    '  "name": "Web Design",',
    '  "mainEntity": {',
    '    "@type": "ItemList",',
    '    "numberOfItems": 3,',
    '    "itemListElement": [',
    '      { "position": 1, "name": "Best Fonts..." },',
    '      { "position": 2, "name": "Page Speed..." },',
    '      { "position": 3, "name": "Responsive..." }',
    "    ]",
    "  },",
    '  "breadcrumb": { "@type": "BreadcrumbList", ... }',
    "}",
]
for line in schema_lines:
    story.append(Paragraph(line, styles["code"]))

story.append(PageBreak())

# ─── SECTION 6: BEST PRACTICES ───
story.append(Paragraph("6. Best Practices", styles["h1"]))

practices = [
    ("<b>One hub per major topic</b>", "Don't create too many hubs. Each should represent a core area of your expertise. Quality over quantity."),
    ("<b>5-15 spoke pages per hub</b>", "Enough to show depth, not so many it becomes unfocused. Add spokes over time as you create content."),
    ("<b>Write a strong pillar page</b>", "This is your most comprehensive piece on the topic. AI will cite this first when looking for authoritative sources."),
    ("<b>Use descriptive excerpts</b>", "These appear in llms.txt and help AI understand each page's value without reading the full content."),
    ("<b>Interlink naturally</b>", "The hub system auto-links, but also reference spoke pages within your article content for additional context."),
    ("<b>Pick the right content type</b>", "Use 'Article' for spokes so they get Article schema with author and date. Use 'PAGE' for the pillar guide."),
    ("<b>Keep hubs updated</b>", "Add new spoke pages as you create content. Fresh, growing hubs signal active expertise to AI crawlers."),
]

for i, (title, desc) in enumerate(practices, 1):
    story.append(Paragraph(f"{i}. {title}", styles["h3"]))
    story.append(Paragraph(desc, styles["body_gray"]))
    story.append(Spacer(1, 6))

# ─── SECTION 7: COMPARISON TABLE ───
story.append(Spacer(1, 8))
story.append(Paragraph("7. Parsley vs WordPress", styles["h1"]))
story.append(Paragraph(
    "Here's how Parsley's built-in hub system compares to achieving the same result in WordPress:",
    styles["body"]
))
story.append(Spacer(1, 12))

comparison_data = [
    [Paragraph("<b>Feature</b>", styles["table_header"]),
     Paragraph("<b>WordPress</b>", styles["table_header"]),
     Paragraph("<b>Parsley</b>", styles["table_header"])],
    [Paragraph("Topic clustering", styles["table_cell"]),
     Paragraph("Manual (categories/tags)", styles["table_cell"]),
     Paragraph("Built-in Hub system", styles["table_cell"])],
    [Paragraph("Auto internal linking", styles["table_cell"]),
     Paragraph("No", styles["table_cell"]),
     Paragraph("Yes (hub <-> spoke)", styles["table_cell"])],
    [Paragraph("Schema.org for clusters", styles["table_cell"]),
     Paragraph("Plugin required", styles["table_cell"]),
     Paragraph("Automatic", styles["table_cell"])],
    [Paragraph("llms.txt grouping", styles["table_cell"]),
     Paragraph("Not available", styles["table_cell"]),
     Paragraph("Automatic", styles["table_cell"])],
    [Paragraph("Hub landing pages", styles["table_cell"]),
     Paragraph("Manual creation", styles["table_cell"]),
     Paragraph("Auto-generated", styles["table_cell"])],
    [Paragraph("Breadcrumbs", styles["table_cell"]),
     Paragraph("Plugin required", styles["table_cell"]),
     Paragraph("Automatic", styles["table_cell"])],
    [Paragraph("AI crawler visibility", styles["table_cell"]),
     Paragraph("Limited", styles["table_cell"]),
     Paragraph("Full (llms.txt + Schema)", styles["table_cell"])],
]

comp_table = Table(comparison_data, colWidths=[2.2*inch, 2.2*inch, 2.2*inch])
comp_table.setStyle(TableStyle([
    ("BACKGROUND", (0, 0), (-1, 0), GREEN),
    ("TEXTCOLOR", (0, 0), (-1, 0), WHITE),
    ("ALIGN", (0, 0), (-1, -1), "LEFT"),
    ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
    ("GRID", (0, 0), (-1, -1), 0.5, HexColor("#e5e7eb")),
    ("ROWBACKGROUNDS", (0, 1), (-1, -1), [WHITE, LIGHT_GRAY]),
    ("TOPPADDING", (0, 0), (-1, -1), 8),
    ("BOTTOMPADDING", (0, 0), (-1, -1), 8),
    ("LEFTPADDING", (0, 0), (-1, -1), 10),
]))
story.append(comp_table)

# ─── FOOTER ───
story.append(Spacer(1, 36))
story.append(HRFlowable(width="100%", color=GREEN, thickness=2))
story.append(Spacer(1, 12))
story.append(Paragraph("Parsley CMS - Built for the AI search era", styles["footer"]))
story.append(Paragraph("https://parsley.dev", styles["footer"]))

# Build
doc.build(story)
print(f"PDF generated: {OUTPUT}")
