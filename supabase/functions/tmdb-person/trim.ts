// Pure helper for tmdb-person: shape one TMDB person (fetched with
// append_to_response=combined_credits) into a profile plus their best-known work.

export interface Credit {
  id: number;
  type: "movie" | "tv";
  title: string;
  year: number | null;
  character: string;
  poster: string | null;
  rating: number | null;
}

export interface TmdbPerson {
  id: number;
  name: string;
  photo: string | null;
  biography: string;
  birthday: string | null; // YYYY-MM-DD
  deathday: string | null;
  birthplace: string;
  knownFor: string; // e.g. "Acting"
  credits: Credit[];
}

const PHOTO_BASE = "https://image.tmdb.org/t/p/w342";
const POSTER_BASE = "https://image.tmdb.org/t/p/w342";
const MAX_CREDITS = 20;
const MAX_BIO = 1500;
// TMDB genre ids for talk shows and news: guest appearances, not acting work.
const SKIP_GENRES = new Set([10767, 10763]);
const SELF_ROLE = /\b(self|himself|herself|themselves)\b/i;

function yearOf(date?: string): number | null {
  const y = Number((date ?? "").slice(0, 4));
  return Number.isInteger(y) && y > 1800 ? y : null;
}

function isoDate(value: unknown): string | null {
  return typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value) ? value : null;
}

function clip(text: string, max: number): string {
  const t = text.trim();
  return t.length <= max ? t : `${t.slice(0, max - 1).trimEnd()}…`;
}

// deno-lint-ignore no-explicit-any
export function trimPerson(raw: any): TmdbPerson {
  // deno-lint-ignore no-explicit-any
  const cast: any[] = Array.isArray(raw?.combined_credits?.cast) ? raw.combined_credits.cast : [];

  const seen = new Set<string>();
  const credits: Credit[] = cast
    .filter((c) => c?.media_type === "movie" || c?.media_type === "tv")
    .filter((c) => !(c.genre_ids ?? []).some((g: number) => SKIP_GENRES.has(g)))
    .filter((c) => !SELF_ROLE.test(String(c.character ?? "")))
    .sort((a, b) => (b.popularity ?? 0) - (a.popularity ?? 0))
    .filter((c) => {
      const key = `${c.media_type}-${c.id}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    })
    .map((c) => ({
      id: c.id,
      type: c.media_type,
      title: String(c.title ?? c.name ?? "").trim(),
      year: yearOf(c.release_date ?? c.first_air_date),
      character: String(c.character ?? "").trim(),
      poster: c.poster_path ? `${POSTER_BASE}${c.poster_path}` : null,
      rating: typeof c.vote_average === "number" && c.vote_count > 0
        ? Math.round(c.vote_average * 10) / 10
        : null,
    }))
    .filter((c) => c.title)
    .slice(0, MAX_CREDITS);

  return {
    id: raw?.id,
    name: String(raw?.name ?? "").trim(),
    photo: raw?.profile_path ? `${PHOTO_BASE}${raw.profile_path}` : null,
    biography: clip(String(raw?.biography ?? ""), MAX_BIO),
    birthday: isoDate(raw?.birthday),
    deathday: isoDate(raw?.deathday),
    birthplace: String(raw?.place_of_birth ?? "").trim(),
    knownFor: String(raw?.known_for_department ?? "").trim(),
    credits,
  };
}
