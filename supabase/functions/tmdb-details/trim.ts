// Pure helper for tmdb-details: shape one TMDB movie/series (fetched with
// append_to_response=credits) into the fields the details page shows.

export interface CastMember {
  name: string;
  character: string;
  photo: string | null;
}

export interface TmdbDetails {
  id: number;
  type: "movie" | "tv";
  title: string;
  tagline: string;
  year: number | null;
  overview: string;
  genres: string[];
  runtime: number | null; // minutes (per episode for series)
  seasons: number | null;
  episodes: number | null;
  status: string;
  rating: number | null; // 0-10, one decimal
  poster: string | null;
  backdrop: string | null;
  directors: string[]; // directors for a film, creators for a series
  cast: CastMember[];
}

const POSTER_BASE = "https://image.tmdb.org/t/p/w500";
const BACKDROP_BASE = "https://image.tmdb.org/t/p/w780";
const PHOTO_BASE = "https://image.tmdb.org/t/p/w185";
const MAX_CAST = 12;

function yearOf(date?: string): number | null {
  const y = Number((date ?? "").slice(0, 4));
  return Number.isInteger(y) && y > 1800 ? y : null;
}

function positive(n: unknown): number | null {
  return typeof n === "number" && n > 0 ? n : null;
}

// deno-lint-ignore no-explicit-any
export function trimDetails(type: "movie" | "tv", raw: any): TmdbDetails {
  const isTv = type === "tv";
  const directors: string[] = isTv
    ? (raw?.created_by ?? []).map((p: { name?: string }) => p?.name)
    // deno-lint-ignore no-explicit-any
    : (raw?.credits?.crew ?? []).filter((c: any) => c?.job === "Director").map((c: any) => c?.name);

  const cast: CastMember[] = (raw?.credits?.cast ?? [])
    // deno-lint-ignore no-explicit-any
    .filter((c: any) => c?.name)
    .slice(0, MAX_CAST)
    // deno-lint-ignore no-explicit-any
    .map((c: any) => ({
      name: String(c.name),
      character: String(c.character ?? ""),
      photo: c.profile_path ? `${PHOTO_BASE}${c.profile_path}` : null,
    }));

  return {
    id: raw?.id,
    type,
    title: String(raw?.title ?? raw?.name ?? "").trim(),
    tagline: String(raw?.tagline ?? "").trim(),
    year: yearOf(raw?.release_date ?? raw?.first_air_date),
    overview: String(raw?.overview ?? "").trim(),
    // deno-lint-ignore no-explicit-any
    genres: (raw?.genres ?? []).map((g: any) => g?.name).filter(Boolean),
    runtime: positive(isTv ? raw?.episode_run_time?.[0] : raw?.runtime),
    seasons: isTv ? positive(raw?.number_of_seasons) : null,
    episodes: isTv ? positive(raw?.number_of_episodes) : null,
    status: String(raw?.status ?? ""),
    rating: typeof raw?.vote_average === "number" && raw.vote_count > 0
      ? Math.round(raw.vote_average * 10) / 10
      : null,
    poster: raw?.poster_path ? `${POSTER_BASE}${raw.poster_path}` : null,
    backdrop: raw?.backdrop_path ? `${BACKDROP_BASE}${raw.backdrop_path}` : null,
    directors: directors.filter(Boolean),
    cast,
  };
}
