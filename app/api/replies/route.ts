import { NextRequest } from "next/server";
import { getOpenAIClient } from "@/lib/openai";
import { RepliesBody } from "./discern";

export const runtime = "edge";

export async function POST(req: NextRequest) {
  try {
    const json = await req.json();
    const { comments, persona, language } = RepliesBody.parse(json);

    const system = [
      "You write short, friendly YouTube comment replies.",
      "Keep a consistent creator persona and avoid sounding generic.",
      "Return JSON only.",
    ].join(" ");

    const prompt = [
      `Persona: ${persona}`,
      `Language: ${language}`,
      "Return JSON array 'replies', one per input comment order.",
      "Input comments:",
      ...comments.map((c, i) => `${i + 1}. ${c}`)
    ].join("\n");

    const openai = getOpenAIClient();
    const resp = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      temperature: 0.6,
      messages: [
        { role: "system", content: system },
        { role: "user", content: prompt },
      ],
      response_format: { type: "json_object" },
    });

    const text = resp.choices[0]?.message?.content || "{}";
    let data: unknown;
    try { data = JSON.parse(text); } catch { data = { replies: [], raw: text }; }

    return new Response(JSON.stringify({ ok: true, data }), { headers: { "content-type": "application/json" } });
  } catch (err: any) {
    return new Response(JSON.stringify({ ok: false, error: err.message || "unknown error" }), { status: 400 });
  }
}
