import { corsHeaders, json } from "../_shared/cors.ts";
import { tmdbAuth } from "../_shared/tmdb.ts";
import { trimDetails } from "./trim.ts";

// GET ?type=tv&id=76331  or  POST {"type": "tv", "id": 76331}
//   -> { "details": { title, overview, genres, cast, ... } }
// The TMDB credential lives in the TMDB_API_KEY secret and never reaches the browser.

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  let type: unknown;
  let id: unknown;
  if (req.method === "POST") {
    try {
      const body = await req.json();
      type = body?.type;
      id = body?.id;
    } catch {
      return json({ error: "Request body must be valid JSON like {\"type\": \"tv\", \"id\": 76331}." }, 400);
    }
  } else {
    const params = new URL(req.url).searchParams;
    type = params.get("type");
    id = params.get("id");
  }

  if (type !== "movie" && type !== "tv") {
    return json({ error: "'type' must be \"movie\" or \"tv\"." }, 400);
  }
  const idText = String(id ?? "");
  if (!/^\d{1,9}$/.test(idText)) {
    return json({ error: "'id' must be a positive whole number." }, 400);
  }

  const key = Deno.env.get("TMDB_API_KEY");
  if (!key) return json({ error: "Server is missing the TMDB_API_KEY secret." }, 500);

  const auth = tmdbAuth(key);
  const url =
    `https://api.themoviedb.org/3/${type}/${idText}?append_to_response=credits&language=en-US${auth.param}`;

  let res: Response;
  try {
    res = await fetch(url, { headers: { Accept: "application/json", ...auth.headers } });
  } catch {
    return json({ error: "Could not reach TMDB." }, 502);
  }
  if (res.status === 404) return json({ error: `No ${type} with id ${idText} on TMDB.` }, 404);
  if (!res.ok) return json({ error: `TMDB responded with status ${res.status}.` }, 502);

  return json({ details: trimDetails(type, await res.json()) });
});
