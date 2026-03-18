import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import PageEditor from "@/components/editor/PageEditor";

export default async function EditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const page = await prisma.page.findUnique({ where: { id } });

  if (!page) {
    notFound();
  }

  return (
    <PageEditor
      page={{
        id: page.id,
        title: page.title,
        slug: page.slug,
        content: page.content as Record<string, unknown> | null,
        contentType: page.contentType,
        collection: page.collection || "",
        status: page.status,
        metaTitle: page.metaTitle || "",
        metaDescription: page.metaDescription || "",
        excerpt: page.excerpt || "",
      }}
    />
  );
}
