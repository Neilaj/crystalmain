# Parsley CMS — Product Roadmap

## ✅ v0.1 — MVP (Complete)
- [x] Next.js App Router scaffolding
- [x] PostgreSQL + Prisma database
- [x] Authentication (login/signup, JWT, middleware)
- [x] Admin dashboard with sidebar navigation
- [x] Tiptap block editor (pages CRUD, draft/publish)
- [x] Content types (Landing, Article, FAQ, Service, Product, Page)
- [x] SEO fields per page (meta title, description, OG image, slug)
- [x] Public site rendering (SSR, semantic HTML, dynamic routes)
- [x] Crystal Studios homepage with 3D GLB viewer
- [x] AI search optimization (JSON-LD, llms.txt, sitemap.xml, RSS, robots.txt)
- [x] Content Hub system (pillar + spoke pages, auto-linking, schema)
- [x] Site settings (name, logo, favicon, socials, footer)
- [x] Navigation editor with drag-and-drop reordering
- [x] Media library (upload, grid view, alt text, delete)
- [x] AI Writing Assistant (Claude-powered content generation in editor)

---

## 🔨 v0.2 — Security & Production Hardening
- [ ] Input sanitization (XSS prevention on editor content, API inputs)
- [ ] Rate limiting (login, API routes, AI assistant)
- [ ] CSRF protection
- [ ] Content Security Policy headers
- [ ] Image/file upload validation (type, size, malware scan)
- [ ] Password strength requirements
- [ ] Session management (token expiry, refresh, revocation)
- [ ] Error handling (graceful failures, no stack traces in production)
- [ ] Database connection pooling (Neon/Supabase production config)
- [ ] Email integration (Resend) for password reset
- [ ] Audit logging (who changed what, when)

---

## 🚀 v0.3 — Templates & Themes
- [ ] Template system architecture (layout + color + typography configs)
- [ ] 3 starter templates:
  - Clean Blog — minimal, content-focused
  - Business — homepage + about + services + blog
  - Portfolio — image/3D-heavy project showcases
- [ ] Theme customizer in admin (colors, fonts, spacing)
- [ ] Template preview before applying
- [ ] Custom CSS override option

---

## 🔌 v0.4 — Plugin System
- [ ] Plugin registration system (`parsley.plugins.ts` config)
- [ ] Hook system (admin sidebar, editor blocks, page rendering, API routes)
- [ ] Plugin API (access to database, auth context, site settings)
- [ ] Plugin documentation & developer guide
- [ ] First-party plugins:
  - Contact Form (form builder + submissions inbox)
  - Analytics (built-in dashboard, AI crawler tracking)
  - Newsletter (email capture + Resend/Mailchimp integration)
  - Comments (threaded, moderated)
  - Social Sharing (auto-post on publish)

---

## 📦 v0.5 — WordPress Importer
- [ ] WP REST API connector (authenticate, fetch content)
- [ ] Import pages and posts → Parsley pages with content type mapping
- [ ] Import media library (download + re-upload to Vercel Blob/S3)
- [ ] Import categories/tags → Hub mapping suggestions
- [ ] Import navigation menus
- [ ] Import users (with password reset flow)
- [ ] Preserve slugs and redirects (301 mapping)
- [ ] Import preview & conflict resolution UI
- [ ] Rollback capability
- [ ] Migration report (what imported, what was skipped, what needs attention)

---

## 🔗 v0.6 — Backlink & Citation Tracking
- [ ] **Backlink Monitor**
  - Integrate with Ahrefs/Moz API (or build lightweight crawler)
  - Dashboard showing who links to each page
  - New/lost backlink notifications
  - Domain authority of linking sites
  - Anchor text analysis
- [ ] **AI Citation Tracker**
  - Monitor when AI search engines (ChatGPT, Perplexity, Claude) cite your content
  - Track which pages get cited most
  - Citation trend graphs over time
  - "Your site was cited X times this week" dashboard widget
- [ ] **Link Health**
  - Internal broken link scanner
  - External broken link detector
  - Redirect chain warnings
  - Orphan page detection (pages with no internal links)
- [ ] **Outreach Suggestions**
  - Identify sites in your hub topics that don't link to you
  - Suggest outreach targets based on content relevance
  - Track outreach status (contacted, responded, linked)
- [ ] **Internal Link Optimizer**
  - "Page X has no internal links — connect it to your Web Design hub"
  - Suggest cross-links between spoke pages in the same hub
  - Link density scoring per page
  - Auto-suggest contextual internal links while writing in the editor

---

## 🌐 v0.7 — Multi-Tenancy
- [ ] Subdomain routing (`mysite.parsley.dev`)
- [ ] Custom domain support (DNS + SSL via Vercel API)
- [ ] Tenant isolation (data, media, settings)
- [ ] User signup → auto-provision site
- [ ] Onboarding wizard (pick template, add content, go live)
- [ ] Admin super-dashboard (manage all tenants)
- [ ] Usage limits per tier (pages, media storage, AI requests)

---

## 💰 v0.8 — Monetization
- [ ] Stripe billing integration
- [ ] Free tier (core CMS, 1 site, 50 pages, no AI)
- [ ] Pro tier ($29/mo — unlimited pages, AI writer, hub system, analytics)
- [ ] Agency tier ($99/mo — 10 sites, white-label, WordPress importer, priority support)
- [ ] Template marketplace (agencies sell templates, Parsley takes %)
- [ ] Plugin marketplace (developers sell plugins)

---

## 🔮 Future Ideas
- [ ] Headless API mode (use Parsley as backend, bring your own frontend)
- [ ] Markdown import/export
- [ ] Collaboration (multiple editors, real-time cursors)
- [ ] Version history & content rollback
- [ ] A/B testing for pages
- [ ] AI content scoring ("This page scores 7/10 for AI citability — add FAQ section")
- [ ] Multi-language (i18n with per-language pages)
- [ ] 3D Product Catalog plugin (batch GLB upload, auto USDZ, AR Quick Look)
- [ ] Voice content creation (dictate → AI structures into page)
- [ ] Scheduled publishing (publish page at future date/time)
- [ ] Webhook system (notify external services on publish/update/delete)
