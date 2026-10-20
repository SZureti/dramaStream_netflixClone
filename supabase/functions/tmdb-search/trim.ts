// Pure helpers for tmdb-search: shape TMDB's big /search/multi payload into the
// few fields the front-end shows. Kept separate so unit tests can import it.

export interface TmdbHit {
  id: number;
  type: "movie" | "tv";
  title: string;
  year: number | null;
  overview: string;
  poster: string | null;
  rating: number | null; // 0-10, one decimal
}

const IMAGE_BASE = "https://image.tmdb.org/t/p/w342";
const MAX_RESULTS = 12;
const MAX_OVERVIEW = 220;

function yearOf(date?: string): number | null {
  const y = Number((date ?? "").slice(0, 4));
  return Number.isInteger(y) && y > 1800 ? y : null;
}

function clip(text: string): string {
  const t = text.trim();
  return t.length <= MAX_OVERVIEW ? t : `${t.slice(0, MAX_OVERVIEW - 1).trimEnd()}…`;
}

// deno-lint-ignore no-explicit-any
export function trimResults(raw: any): TmdbHit[] {
  const results = Array.isArray(raw?.results) ? raw.results : [];
  const hits: TmdbHit[] = [];
  for (const r of results) {
    if (r?.media_type !== "movie" && r?.media_type !== "tv") continue; // skip people
    const title = String(r.title ?? r.name ?? "").trim();
    if (!title) continue;
    hits.push({
      id: r.id,
      type: r.media_type,
      title,
      year: yearOf(r.release_date ?? r.first_air_date),
      overview: clip(String(r.overview ?? "")),
      poster: r.poster_path ? `${IMAGE_BASE}${r.poster_path}` : null,
      rating: typeof r.vote_average === "number" && r.vote_count > 0
        ? Math.round(r.vote_average * 10) / 10
        : null,
    });
    if (hits.length === MAX_RESULTS) break;
  }
  return hits;
}

export { tmdbAuth } from "../_shared/tmdb.ts";
