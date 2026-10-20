import { corsHeaders, json } from "../_shared/cors.ts";

// Accepts ?a=6&b=6 (GET) or {"a": 6, "b": 6} (POST). Returns {"result": 36}.
function toNumber(value: unknown): number | null {
  if (value === null || value === undefined || value === "") return null;
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  let rawA: unknown;
  let rawB: unknown;
  if (req.method === "POST") {
    try {
      const body = await req.json();
      rawA = body?.a;
      rawB = body?.b;
    } catch {
      return json({ error: "Request body must be valid JSON like {\"a\": 6, \"b\": 6}." }, 400);
    }
  } else {
    const params = new URL(req.url).searchParams;
    rawA = params.get("a");
    rawB = params.get("b");
  }

  const a = toNumber(rawA);
  const b = toNumber(rawB);
  if (a === null || b === null) {
    return json({ error: "Both 'a' and 'b' are required and must be valid numbers." }, 400);
  }
  return json({ result: a * b });
});
