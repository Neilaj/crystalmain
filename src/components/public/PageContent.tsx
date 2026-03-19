"use client";

import { useEffect, useState } from "react";
import FormEmbed from "./FormEmbed";

interface Props {
  html: string;
}

export default function PageContent({ html }: Props) {
  const [parts, setParts] = useState<Array<{ type: "html" | "form"; content: string }>>([]);

  useEffect(() => {
    // Split HTML at form embed points
    const regex = /<div data-contact-form="([^"]*)"[^>]*class="parsley-form-embed"[^>]*><\/div>/g;
    const result: Array<{ type: "html" | "form"; content: string }> = [];
    let lastIndex = 0;
    let match;

    while ((match = regex.exec(html)) !== null) {
      // Add HTML before the form
      if (match.index > lastIndex) {
        result.push({ type: "html", content: html.slice(lastIndex, match.index) });
      }
      // Add form placeholder
      result.push({ type: "form", content: match[1] });
      lastIndex = match.index + match[0].length;
    }

    // Add remaining HTML
    if (lastIndex < html.length) {
      result.push({ type: "html", content: html.slice(lastIndex) });
    }

    // If no forms found, just use the HTML as-is
    if (result.length === 0) {
      result.push({ type: "html", content: html });
    }

    setParts(result);
  }, [html]);

  return (
    <>
      {parts.map((part, i) =>
        part.type === "form" ? (
          <FormEmbed key={i} formSlug={part.content} />
        ) : (
          <div
            key={i}
            className="page-content prose prose-lg max-w-none prose-headings:text-gray-900 prose-p:text-gray-600 prose-a:text-red-600"
            dangerouslySetInnerHTML={{ __html: part.content }}
          />
        )
      )}
    </>
  );
}
