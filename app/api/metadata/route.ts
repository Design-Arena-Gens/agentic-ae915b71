import { NextRequest } from "next/server";
import { z } from "zod";
import { getOpenAIClient } from "@/lib/openai";

export const runtime = "edge";

const Body = z.object({
  topic: z.string().min(3, "topic too short"),
  language: z.string().optional().default("en"),
  audience: z.string().optional(),
  style: z.string().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const json = await req.json();
    const { topic, language, audience, style } = Body.parse(json);

    const system = [
      "You are an expert YouTube content strategist.",
      "Generate high-retention metadata optimized for CTR and search.",
      "Return concise JSON only.",
    ].join(" ");

    const prompt = [
      `Topic: ${topic}`,
      audience ? `Audience: ${audience}` : undefined,
      style ? `Style: ${style}` : undefined,
      `Language: ${language}`,
      "Return JSON with: title, description, tags (10-20), thumbnailPrompt.",
      "Avoid markdown."
    ].filter(Boolean).join("\n");

    const openai = getOpenAIClient();
    const resp = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      temperature: 0.7,
      messages: [
        { role: "system", content: system },
        { role: "user", content: prompt },
      ],
      response_format: { type: "json_object" },
    });

    const text = resp.choices[0]?.message?.content || "{}";
    let data: unknown;
    try { data = JSON.parse(text); } catch { data = { raw: text }; }

    return new Response(JSON.stringify({ ok: true, topic, data }), {
      headers: { "content-type": "application/json" }
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ ok: false, error: err.message || "unknown error" }), { status: 400 });
  }
}
