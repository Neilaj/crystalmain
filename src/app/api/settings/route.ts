import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET /api/settings
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = (session.user as { id: string }).id;
  const site = await prisma.site.findUnique({ where: { userId } });
  if (!site) {
    return NextResponse.json({ error: "No site found" }, { status: 404 });
  }

  return NextResponse.json(site);
}

// PUT /api/settings
export async function PUT(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = (session.user as { id: string }).id;
  const site = await prisma.site.findUnique({ where: { userId } });
  if (!site) {
    return NextResponse.json({ error: "No site found" }, { status: 404 });
  }

  const body = await req.json();
  const {
    name, tagline, description, logo, favicon, theme,
    socialTwitter, socialLinkedin, socialGithub, socialYoutube,
    footerText, analyticsSnippet,
  } = body;

  const updated = await prisma.site.update({
    where: { id: site.id },
    data: {
      name: name ?? site.name,
      tagline: tagline !== undefined ? tagline : site.tagline,
      description: description !== undefined ? description : site.description,
      logo: logo !== undefined ? logo : site.logo,
      favicon: favicon !== undefined ? favicon : site.favicon,
      theme: theme ?? site.theme,
      socialTwitter: socialTwitter !== undefined ? socialTwitter : site.socialTwitter,
      socialLinkedin: socialLinkedin !== undefined ? socialLinkedin : site.socialLinkedin,
      socialGithub: socialGithub !== undefined ? socialGithub : site.socialGithub,
      socialYoutube: socialYoutube !== undefined ? socialYoutube : site.socialYoutube,
      footerText: footerText !== undefined ? footerText : site.footerText,
      analyticsSnippet: analyticsSnippet !== undefined ? analyticsSnippet : site.analyticsSnippet,
    },
  });

  return NextResponse.json(updated);
}
