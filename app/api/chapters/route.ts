import { NextRequest } from "next/server";
import { z } from "zod";
import { getOpenAIClient } from "@/lib/openai";

export const runtime = "edge";

const Body = z.object({
  transcript: z.string().min(20, "transcript too short"),
  language: z.string().optional().default("en"),
});

export async function POST(req: NextRequest) {
  try {
    const json = await req.json();
    const { transcript, language } = Body.parse(json);

    const system = [
      "You segment long-form videos into YouTube chapters with timestamps.",
      "Prefer ~6-12 chapters with clear, concise titles.",
      "Return JSON only.",
    ].join(" ");

    const prompt = [
      `Language: ${language}`,
      "Return JSON array chapters with fields: start, end, title.",
      "Timestamps in mm:ss or hh:mm:ss.",
      "Base on transcript: \n\n" + transcript
    ].join("\n");

    const openai = getOpenAIClient();
    const resp = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      temperature: 0.3,
      messages: [
        { role: "system", content: system },
        { role: "user", content: prompt },
      ],
      response_format: { type: "json_object" },
    });

    const text = resp.choices[0]?.message?.content || "{}";
    let data: unknown;
    try { data = JSON.parse(text); } catch { data = { chapters: [], raw: text }; }

    return new Response(JSON.stringify({ ok: true, data }), { headers: { "content-type": "application/json" } });
  } catch (err: any) {
    return new Response(JSON.stringify({ ok: false, error: err.message || "unknown error" }), { status: 400 });
  }
}
