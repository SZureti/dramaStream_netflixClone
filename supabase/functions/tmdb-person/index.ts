import { corsHeaders, json } from "../_shared/cors.ts";
import { tmdbAuth } from "../_shared/tmdb.ts";
import { trimPerson } from "./trim.ts";

// GET ?id=1136406  or  POST {"id": 1136406}
//   -> { "person": { name, photo, biography, birthday, credits: [...] } }
// The TMDB credential lives in the TMDB_API_KEY secret and never reaches the browser.

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  let id: unknown;
  if (req.method === "POST") {
    try {
      id = (await req.json())?.id;
    } catch {
      return json({ error: "Request body must be valid JSON like {\"id\": 1136406}." }, 400);
    }
  } else {
    id = new URL(req.url).searchParams.get("id");
  }

  const idText = String(id ?? "");
  if (!/^\d{1,9}$/.test(idText)) {
    return json({ error: "'id' must be a positive whole number." }, 400);
  }

  const key = Deno.env.get("TMDB_API_KEY");
  if (!key) return json({ error: "Server is missing the TMDB_API_KEY secret." }, 500);

  const auth = tmdbAuth(key);
  const url =
    `https://api.themoviedb.org/3/person/${idText}?append_to_response=combined_credits&language=en-US${auth.param}`;

  let res: Response;
  try {
    res = await fetch(url, { headers: { Accept: "application/json", ...auth.headers } });
  } catch {
    return json({ error: "Could not reach TMDB." }, 502);
  }
  if (res.status === 404) return json({ error: `No person with id ${idText} on TMDB.` }, 404);
  if (!res.ok) return json({ error: `TMDB responded with status ${res.status}.` }, 502);

  return json({ person: trimPerson(await res.json()) });
});
