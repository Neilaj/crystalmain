import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { hashSync } from "bcryptjs";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
});
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("🌿 Seeding Parsley...");

  const user = await prisma.user.upsert({
    where: { email: "admin@parsley.dev" },
    update: {},
    create: {
      email: "admin@parsley.dev",
      passwordHash: hashSync("password123", 10),
      name: "Admin",
      role: "ADMIN",
    },
  });

  const site = await prisma.site.upsert({
    where: { userId: user.id },
    update: {},
    create: {
      name: "My Parsley Site",
      tagline: "Built for AI search engines",
      description:
        "A modern website optimized for AI search engines by default.",
      theme: "clean-blog",
      userId: user.id,
    },
  });

  await prisma.page.upsert({
    where: { siteId_slug: { siteId: site.id, slug: "" } },
    update: {},
    create: {
      title: "Welcome to Parsley",
      slug: "",
      status: "PUBLISHED",
      contentType: "LANDING",
      metaTitle: "My Parsley Site — Built for AI Search",
      metaDescription:
        "A modern website that AI search engines love to crawl and cite.",
      content: {
        type: "doc",
        content: [
          {
            type: "heading",
            attrs: { level: 1 },
            content: [{ type: "text", text: "Welcome to Parsley" }],
          },
          {
            type: "paragraph",
            content: [
              {
                type: "text",
                text: "Your site is live and optimized for AI search engines.",
              },
            ],
          },
        ],
      },
      publishedAt: new Date(),
      siteId: site.id,
      authorId: user.id,
    },
  });

  await prisma.page.upsert({
    where: { siteId_slug: { siteId: site.id, slug: "about" } },
    update: {},
    create: {
      title: "About",
      slug: "about",
      status: "PUBLISHED",
      contentType: "PAGE",
      metaTitle: "About — My Parsley Site",
      metaDescription: "Learn more about us and what we do.",
      content: {
        type: "doc",
        content: [
          {
            type: "heading",
            attrs: { level: 1 },
            content: [{ type: "text", text: "About Us" }],
          },
          {
            type: "paragraph",
            content: [
              {
                type: "text",
                text: "This is your about page. Edit it from the admin panel.",
              },
            ],
          },
        ],
      },
      publishedAt: new Date(),
      siteId: site.id,
      authorId: user.id,
    },
  });

  // Delete existing nav items (in case of re-seed)
  await prisma.navigation.deleteMany({ where: { siteId: site.id } });

  const navItems = [
    { label: "Services", url: "#services", order: 0, location: "HEADER" as const },
    { label: "Work", url: "#work", order: 1, location: "HEADER" as const },
    { label: "Process", url: "#process", order: 2, location: "HEADER" as const },
    { label: "About", url: "/about", order: 3, location: "BOTH" as const },
    { label: "Contact", url: "#contact", order: 4, location: "BOTH" as const },
    { label: "Privacy Policy", url: "/privacy", order: 5, location: "FOOTER" as const },
    { label: "Terms of Service", url: "/terms", order: 6, location: "FOOTER" as const },
  ];

  for (const nav of navItems) {
    await prisma.navigation.create({
      data: { ...nav, siteId: site.id },
    });
  }

  // Create default contact form
  await prisma.contactForm.upsert({
    where: { siteId_slug: { siteId: site.id, slug: "contact" } },
    update: {},
    create: {
      name: "Contact Form",
      slug: "contact",
      description: "Get in touch with us",
      fields: [
        { name: "name", label: "Your Name", type: "text", placeholder: "John Smith", required: true, width: "half" },
        { name: "email", label: "Email Address", type: "email", placeholder: "john@example.com", required: true, width: "half" },
        { name: "message", label: "Message", type: "textarea", placeholder: "Tell us about your project...", required: true, width: "full" },
      ],
      submitLabel: "Send Message",
      successMessage: "Thank you! We'll get back to you within 24 hours.",
      siteId: site.id,
    },
  });

  console.log("✅ Seeded: admin@parsley.dev / password123");
  console.log("✅ Site created with homepage, about page, and contact form");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
