import { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import AIVideoPage from "@/components/public/AIVideoPage";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "AI Video Production for Social Media | Crystal Studios",
  description:
    "Crystal Studios produces AI-generated video content for Instagram Reels, TikTok, YouTube Shorts, and more. Stop the scroll, build your brand, and convert viewers into customers.",
  openGraph: {
    title: "AI Video Production for Social Media | Crystal Studios",
    description:
      "AI-generated video content that stops the scroll and drives real business results — on every platform your customers live on.",
    type: "website",
  },
  alternates: {
    canonical: "/ai-video-production",
  },
};

export default async function AIVideoProductionPage() {
  const site = await prisma.site.findFirst();
  const siteLogo = site?.logo || "";

  const allNav = site
    ? await prisma.navigation.findMany({
        where: { siteId: site.id },
        orderBy: { order: "asc" },
        select: { id: true, label: true, url: true, openNew: true, location: true },
      })
    : [];

  return (
    <AIVideoPage
      siteLogo={siteLogo}
      navigation={allNav}
    />
  );
}
