import { prisma } from "./prisma";

export async function getSite() {
  const site = await prisma.site.findFirst({
    include: {
      navigation: {
        orderBy: { order: "asc" },
      },
    },
  });
  return site;
}
