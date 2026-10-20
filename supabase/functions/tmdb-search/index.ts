import { corsHeaders, json } from "../_shared/cors.ts";
import { tmdbAuth } from "../_shared/tmdb.ts";
import { trimResults } from "./trim.ts";

// GET ?q=breaking+bad  or  POST {"q": "breaking bad"}  ->  { "results": [...] }
// The TMDB credential lives in the TMDB_API_KEY secret and never reaches the browser.
const MAX_QUERY = 100;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  let raw: unknown;
  if (req.method === "POST") {
    try {
      raw = (await req.json())?.q;
    } catch {
      return json({ error: "Request body must be valid JSON like {\"q\": \"breaking bad\"}." }, 400);
    }
  } else {
    raw = new URL(req.url).searchParams.get("q");
  }

  const q = typeof raw === "string" ? raw.trim() : "";
  if (!q) return json({ error: "Missing search text: send a 'q' parameter." }, 400);
  if (q.length > MAX_QUERY) return json({ error: `Search text must be ${MAX_QUERY} characters or fewer.` }, 400);

  const key = Deno.env.get("TMDB_API_KEY");
  if (!key) return json({ error: "Server is missing the TMDB_API_KEY secret." }, 500);

  const auth = tmdbAuth(key);
  const url =
    `https://api.themoviedb.org/3/search/multi?query=${encodeURIComponent(q)}&include_adult=false&language=en-US&page=1${auth.param}`;

  let res: Response;
  try {
    res = await fetch(url, { headers: { Accept: "application/json", ...auth.headers } });
  } catch {
    return json({ error: "Could not reach TMDB." }, 502);
  }
  if (!res.ok) return json({ error: `TMDB responded with status ${res.status}.` }, 502);

  return json({ results: trimResults(await res.json()) });
});
