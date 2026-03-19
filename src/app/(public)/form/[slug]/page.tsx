import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { Metadata } from "next";
import PublicForm from "@/components/public/PublicForm";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const form = await prisma.contactForm.findFirst({
    where: { slug, enabled: true },
    include: { site: true },
  });

  if (!form) return { title: "Form Not Found" };

  return {
    title: `${form.name} | ${form.site.name}`,
    description: form.description || `Contact ${form.site.name}`,
  };
}

export default async function FormPage({ params }: Props) {
  const { slug } = await params;
  const form = await prisma.contactForm.findFirst({
    where: { slug, enabled: true },
    include: { site: true },
  });

  if (!form) notFound();

  const fields = form.fields as Array<{
    name: string;
    label: string;
    type: string;
    placeholder?: string;
    required: boolean;
    options?: string[];
    width: string;
  }>;

  // Schema.org JSON-LD for ContactPage
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ContactPage",
    name: form.name,
    description: form.description,
    url: `${form.site.domain || ""}/form/${form.slug}`,
    isPartOf: {
      "@type": "WebSite",
      name: form.site.name,
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <main className="mx-auto max-w-2xl px-4 py-16">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-gray-900">{form.name}</h1>
          {form.description && (
            <p className="mt-2 text-gray-600">{form.description}</p>
          )}
        </div>

        <PublicForm
          formSlug={form.slug}
          fields={fields}
          submitLabel={form.submitLabel}
          successMessage={form.successMessage}
          honeypotEnabled={form.honeypotEnabled}
        />
      </main>
    </>
  );
}
