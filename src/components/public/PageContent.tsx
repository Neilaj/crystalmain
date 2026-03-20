"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import FormEmbed from "./FormEmbed";

const ModelViewer = dynamic(() => import("./ModelViewer"), { ssr: false });

interface Part {
  type: "html" | "form" | "model";
  content: string;
  attrs?: { url: string; name: string; height: number };
}

interface Props {
  html: string;
}

export default function PageContent({ html }: Props) {
  const [parts, setParts] = useState<Part[]>([]);

  useEffect(() => {
    // Combined regex for both forms and models
    const formRegex = /<div data-contact-form="([^"]*)"[^>]*class="parsley-form-embed"[^>]*><\/div>/g;
    const modelRegex = /<div data-model-viewer="true" data-model-url="([^"]*)" data-model-name="([^"]*)" data-model-height="([^"]*)"[^>]*class="parsley-model-embed"[^>]*><\/div>/g;

    // Find all embeds with positions
    const embeds: Array<{ index: number; length: number; part: Part }> = [];

    let match;
    while ((match = formRegex.exec(html)) !== null) {
      embeds.push({
        index: match.index,
        length: match[0].length,
        part: { type: "form", content: match[1] },
      });
    }

    while ((match = modelRegex.exec(html)) !== null) {
      embeds.push({
        index: match.index,
        length: match[0].length,
        part: {
          type: "model",
          content: match[1],
          attrs: {
            url: match[1],
            name: match[2],
            height: parseInt(match[3], 10) || 400,
          },
        },
      });
    }

    // Sort by position
    embeds.sort((a, b) => a.index - b.index);

    const result: Part[] = [];
    let lastIndex = 0;

    for (const embed of embeds) {
      if (embed.index > lastIndex) {
        result.push({ type: "html", content: html.slice(lastIndex, embed.index) });
      }
      result.push(embed.part);
      lastIndex = embed.index + embed.length;
    }

    if (lastIndex < html.length) {
      result.push({ type: "html", content: html.slice(lastIndex) });
    }

    if (result.length === 0) {
      result.push({ type: "html", content: html });
    }

    setParts(result);
  }, [html]);

  return (
    <>
      {parts.map((part, i) => {
        if (part.type === "form") {
          return <FormEmbed key={i} formSlug={part.content} />;
        }
        if (part.type === "model" && part.attrs) {
          return (
            <div key={i} className="my-8">
              <div className="overflow-hidden rounded-2xl border border-gray-200 bg-gray-50">
                <ModelViewer
                  modelUrl={part.attrs.url}
                  className={`w-full`}
                  style={{ height: `${part.attrs.height}px` }}
                />
              </div>
              {part.attrs.name && (
                <p className="mt-2 text-center text-sm text-gray-500">{part.attrs.name}</p>
              )}
            </div>
          );
        }
        return (
          <div
            key={i}
            className="page-content prose prose-lg max-w-none prose-headings:text-gray-900 prose-p:text-gray-600 prose-a:text-red-600"
            dangerouslySetInnerHTML={{ __html: part.content }}
          />
        );
      })}
    </>
  );
}
