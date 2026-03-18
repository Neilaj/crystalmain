import { NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import Anthropic from "@anthropic-ai/sdk";

export const runtime = "nodejs";
export const maxDuration = 60;

const SYSTEM_PROMPT = `You are an expert content writer and SEO/AEO specialist working inside the Parsley CMS editor. Your job is to help users create high-quality, well-structured content that is optimized for both human readers and AI search engines.

Guidelines:
- Write in clean, semantic HTML that can be inserted into a rich text editor
- Use proper heading hierarchy (h2, h3 — never h1, the page title handles that)
- Write engaging, informative content that demonstrates topical authority
- Include natural keyword usage without keyword stuffing
- Structure content with clear sections, bullet points, and short paragraphs
- When writing articles, include an introduction, clear sections, and a conclusion
- When generating FAQ content, use question-and-answer format
- When improving text, maintain the author's voice while enhancing clarity
- Keep paragraphs short (2-3 sentences) for readability
- Use active voice when possible

For SEO/AEO optimization suggestions:
- Suggest meta titles (under 60 characters)
- Suggest meta descriptions (under 160 characters)
- Suggest internal linking opportunities
- Recommend content structure improvements
- Identify missing subtopics that would strengthen the hub

Format your output as clean HTML unless specifically asked for plain text.`;

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
      userMessage = `Write content about: ${prompt}${pageTitle ? `\n\nThis is for a page titled "${pageTitle}".` : ""}${hubName ? `\nThis page belongs to the "${hubName}" content hub.` : ""}${contentType ? `\nContent type: ${contentType}` : ""}`;
      break;

    case "improve":
      userMessage = `Improve the following content. Make it clearer, more engaging, and better optimized for AI search engines. Maintain the author's voice.\n\nCurrent content:\n${content}`;
      break;

    case "expand":
      userMessage = `Expand on the following content. Add more detail, examples, and depth while maintaining the same tone and style.\n\nCurrent content:\n${content}`;
      break;

    case "shorten":
      userMessage = `Shorten the following content. Make it more concise while keeping the key points.\n\nCurrent content:\n${content}`;
      break;

    case "seo":
      userMessage = `Analyze the following content and provide SEO/AEO optimization suggestions. Include:
1. Suggested meta title (under 60 chars)
2. Suggested meta description (under 160 chars)
3. Content structure improvements
4. Missing subtopics or sections
5. Internal linking suggestions
${hubName ? `6. How this content can better support the "${hubName}" hub` : ""}

Format your response as a clear, numbered list (plain text, not HTML).

Content to analyze:
Title: ${pageTitle || "Untitled"}
Type: ${contentType || "PAGE"}
${content || "(No content yet)"}`;
      break;

    case "outline":
      userMessage = `Create a detailed content outline for: ${prompt}${pageTitle ? `\n\nPage title: "${pageTitle}"` : ""}${hubName ? `\nThis belongs to the "${hubName}" content hub.` : ""}${contentType ? `\nContent type: ${contentType}` : ""}

Provide the outline as HTML with h2 and h3 headings, and brief bullet points under each section describing what to cover.`;
      break;

    case "faq":
      userMessage = `Generate 5-8 frequently asked questions and detailed answers about: ${prompt || pageTitle || "this topic"}${hubName ? `\nContext: This is part of the "${hubName}" content hub.` : ""}

Format as HTML using h3 for questions and p tags for answers.`;
      break;

    case "hub-suggestions":
      userMessage = `I have a content hub called "${hubName}". Suggest 5-8 spoke article ideas that would strengthen this hub's topical authority. For each suggestion, provide:
1. Article title
2. Suggested slug
3. Brief description (2-3 sentences)
4. Content type recommendation (Article, FAQ, Service, etc.)

Format as a clean numbered list in plain text.`;
      break;

    default:
      userMessage = prompt;
  }

  const client = new Anthropic({ apiKey });

  // Stream the response
  const stream = await client.messages.stream({
    model: "claude-sonnet-4-20250514",
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
