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

  const navItems = [
    { label: "Home", url: "/", order: 0 },
    { label: "About", url: "/about", order: 1 },
  ];

  for (const nav of navItems) {
    await prisma.navigation.create({
      data: { ...nav, siteId: site.id },
    });
  }

  console.log("✅ Seeded: admin@parsley.dev / password123");
  console.log("✅ Site created with homepage and about page");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
