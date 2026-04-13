import { NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import Anthropic from "@anthropic-ai/sdk";

export const runtime = "nodejs";
export const maxDuration = 60;

const SYSTEM_PROMPT = `You are an expert content writer working inside the Parsley CMS block editor. Your job is to write content that website visitors will read.

CRITICAL RULES:
- Output ONLY the content text itself. No HTML tags, no code blocks, no backticks.
- Never output meta titles, meta descriptions, or SEO suggestions unless the user specifically uses the "seo" action.
- Never include instructions like "Content Improvements Made" or "Internal Linking Opportunities" in your output.
- Write naturally as if you're speaking to the reader — not to the website admin.
- Use proper heading hierarchy: ## for main sections, ### for subsections (these become H2, H3 in the editor).
- Keep paragraphs short (2-3 sentences) for readability.
- Use bullet points where appropriate.
- Write in active voice.
- Be engaging and authoritative without being salesy.
- When improving existing text, maintain the author's voice.

Your output goes directly into a page that customers see. Write accordingly.`;

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return new Response(
      JSON.stringify({ error: "ANTHROPIC_API_KEY is not configured. Add it to your .env file." }),
      { status: 500 }
    );
  }

  const body = await req.json();
  const { prompt, action, content, pageTitle, hubName, contentType } = body;

  if (!prompt && !action) {
    return new Response(JSON.stringify({ error: "Prompt or action is required" }), { status: 400 });
  }

  // Build the user message based on the action
  let userMessage = "";

  switch (action) {
    case "write":
      userMessage = `Write website page content about: ${prompt}${pageTitle ? `\nPage title: "${pageTitle}"` : ""}${contentType ? `\nContent type: ${contentType}` : ""}

Remember: Write ONLY the content that visitors will read. No HTML tags, no SEO suggestions, no meta descriptions. Just clean, well-structured text with ## headings and bullet points where appropriate.`;
      break;

    case "improve":
      userMessage = `Rewrite and improve the following content. Make it clearer, more engaging, and more professional. Keep the same meaning and voice. Output ONLY the improved text — no explanations, no suggestions, no HTML tags.

Current content:
${content}`;
      break;

    case "expand":
      userMessage = `Expand on the following content. Add more detail, examples, and depth. Output ONLY the expanded text — no explanations or suggestions.

Current content:
${content}`;
      break;

    case "shorten":
      userMessage = `Shorten the following content. Make it more concise while keeping the key points. Output ONLY the shortened text.

Current content:
${content}`;
      break;

    case "seo":
      userMessage = `Analyze the following page content and provide SEO/AEO optimization suggestions as a numbered list:

1. Suggested meta title (under 60 chars) — ready to paste into the Meta Title field
2. Suggested meta description (under 160 chars) — ready to paste into the Meta Description field
3. Content structure improvements (if any)
4. Missing topics that would strengthen authority
5. Suggested excerpt (1-2 sentences summarizing the page)
${hubName ? `6. How to better connect this to the "${hubName}" hub` : ""}

Page title: ${pageTitle || "Untitled"}
Content type: ${contentType || "PAGE"}
Content:
${content || "(No content yet)"}`;
      break;

    case "outline":
      userMessage = `Create a content outline for: ${prompt}${pageTitle ? `\nPage title: "${pageTitle}"` : ""}${contentType ? `\nContent type: ${contentType}` : ""}

Write the outline using ## for main sections and ### for subsections, with brief notes under each. Output ONLY the outline — no HTML, no explanations.`;
      break;

    case "faq":
      userMessage = `Write 5-8 frequently asked questions and detailed answers about: ${prompt || pageTitle || "this topic"}

Format each as:
### [Question]?
[Answer paragraph]

Output ONLY the FAQ content — no introductions, no HTML tags, no suggestions.`;
      break;

    case "hub-suggestions":
      userMessage = `I have a content hub called "${hubName}". Suggest 5-8 article ideas that would strengthen this topic cluster. For each:
1. Article title
2. URL slug
3. Brief description (1-2 sentences)
4. Content type (Article, FAQ, Service, etc.)

Format as a clean numbered list.`;
      break;

    default:
      userMessage = prompt;
  }

  const client = new Anthropic({ apiKey });

  // Stream the response
  const stream = await client.messages.stream({
    model: "claude-sonnet-4-6",
    max_tokens: 4096,
    system: SYSTEM_PROMPT,
    messages: [{ role: "user", content: userMessage }],
  });

  // Create a ReadableStream from the Anthropic stream
  const encoder = new TextEncoder();
  const readableStream = new ReadableStream({
    async start(controller) {
      try {
        for await (const event of stream) {
          if (event.type === "content_block_delta" && event.delta.type === "text_delta") {
            controller.enqueue(encoder.encode(`data: ${JSON.stringify({ text: event.delta.text })}\n\n`));
          }
        }
        controller.enqueue(encoder.encode("data: [DONE]\n\n"));
        controller.close();
      } catch (error) {
        controller.enqueue(
          encoder.encode(`data: ${JSON.stringify({ error: String(error) })}\n\n`)
        );
        controller.close();
      }
    },
  });

  return new Response(readableStream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}
