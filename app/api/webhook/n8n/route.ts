import { NextRequest } from "next/server";

export const runtime = "edge";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const action = String(body?.action || "");
    const payload = body?.payload ?? {};

    const baseUrl = new URL(req.url);
    baseUrl.pathname = "/";

    async function call(path: string, payloadData: any) {
      const url = new URL(path, baseUrl);
      const res = await fetch(url.toString(), {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(payloadData),
      });
      if (!res.ok) {
        const errText = await res.text().catch(() => "");
        throw new Error(`Downstream ${path} failed: ${res.status} ${errText}`);
      }
      return res.json();
    }

    if (action === "metadata") {
      return Response.json(await call("/api/metadata", payload));
    }
    if (action === "chapters") {
      return Response.json(await call("/api/chapters", payload));
    }
    if (action === "replies") {
      return Response.json(await call("/api/replies", payload));
    }

    return new Response(JSON.stringify({ ok: false, error: "unknown action" }), { status: 400 });
  } catch (err: any) {
    return new Response(JSON.stringify({ ok: false, error: err.message || "unknown error" }), { status: 400 });
  }
}
