import { NextRequest } from "next/server";

export const runtime = "nodejs";
export const maxDuration = 30;

// Rate limit: 30 TTS requests per IP per hour
const ttsRateMap = new Map<string, { count: number; resetTime: number }>();
function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const entry = ttsRateMap.get(ip);
  if (!entry || now > entry.resetTime) {
    ttsRateMap.set(ip, { count: 1, resetTime: now + 3600000 });
    return false;
  }
  entry.count++;
  return entry.count > 30;
}

// POST — Convert text to speech using ElevenLabs (Chrissy's voice)
export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || "unknown";
  if (isRateLimited(ip)) {
    return new Response(JSON.stringify({ error: "Too many voice requests." }), { status: 429 });
  }

  const apiKey = process.env.ELEVENLABS_API_KEY;
  if (!apiKey) {
    return new Response(JSON.stringify({ error: "Voice not configured." }), { status: 500 });
  }

  const body = await req.json();
  const { text } = body;

  if (!text || typeof text !== "string" || text.length > 1000) {
    return new Response(JSON.stringify({ error: "Invalid text." }), { status: 400 });
  }

  // Chrissy's voice — ElevenLabs "Rachel" (warm, professional female voice)
  const voiceId = "21m00Tcm4TlvDq8ikWAM";

  try {
    const res = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
      method: "POST",
      headers: {
        "xi-api-key": apiKey,
        "Content-Type": "application/json",
        Accept: "audio/mpeg",
      },
      body: JSON.stringify({
        text,
        model_id: "eleven_turbo_v2_5",
        voice_settings: {
          stability: 0.5,
          similarity_boost: 0.75,
          style: 0.3,
        },
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      console.error("ElevenLabs TTS error:", err);
      throw new Error("TTS failed");
    }

    const audioBuffer = await res.arrayBuffer();
    return new Response(audioBuffer, {
      headers: {
        "Content-Type": "audio/mpeg",
        "Cache-Control": "private, max-age=3600",
      },
    });
  } catch (error) {
    console.error("TTS error:", error);
    return new Response(JSON.stringify({ error: "Voice generation failed." }), { status: 500 });
  }
}
