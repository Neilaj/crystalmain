/**
 * One-time script: adds href="/ai-video-production" to the AI Video Production
 * service card in the site's homepageContent stored in the DB.
 *
 * Run with:  npx tsx scripts/patch-video-link.ts
 */

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const site = await prisma.site.findFirst();
  if (!site) { console.log("No site found."); return; }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const content = (site.homepageContent || {}) as any;

  if (!content?.services?.items || !Array.isArray(content.services.items)) {
    console.log("No services.items found in homepageContent — nothing to patch.");
    return;
  }

  let patched = false;
  content.services.items = content.services.items.map((item: any) => {
    if (
      item.title?.toLowerCase().includes("ai video") ||
      item.tag?.toLowerCase().includes("ai video")
    ) {
      console.log(`Patching: "${item.title}" → href="/ai-video-production"`);
      patched = true;
      return { ...item, href: "/ai-video-production" };
    }
    return item;
  });

  if (!patched) {
    console.log('Could not find an "AI Video" service card. Titles found:');
    content.services.items.forEach((i: any) => console.log(" -", i.title));
    return;
  }

  await prisma.site.update({
    where: { id: site.id },
    data: { homepageContent: content },
  });

  console.log("Done ✅  AI Video card now links to /ai-video-production");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
