import { supabase } from '../lib/supabase.js';
import { LOCAL_CATALOG, replaceCatalog } from './catalog.js';

const TIMEOUT_MS = 8000;

// One request: titles with their genres, credits, and series episodes.
// TRAILER_COLUMN comes from supabase/trailers.sql; until that has been run the
// load retries without it and uses the bundled trailer keys.
const TRAILER_COLUMN = 'trailer_youtube_key';
const selectWith = (extra) => `
  id, title, type, synopsis, release_year, content_rating, runtime_minutes,
  seasons, episode_count, limited_series, cast_label, hero_position, is_featured, sort_order,
  available_from, created_at,${extra}
  title_genres ( position, genres ( name ) ),
  credits ( role, role_position, position, people ( name ) ),
  season_rows:seasons ( season_number, episodes ( episode_number, name, runtime_minutes, synopsis, still_path ) )
`;
const SELECT = selectWith(` ${TRAILER_COLUMN},`);
const SELECT_WITHOUT_TRAILER = selectWith('');

const bundledTrailer = (id) => LOCAL_CATALOG.find((t) => t.id === id)?.trailer;

const TYPE_ORDER = { film: 0, series: 1, documentary: 2 };

/** Turn one database row into the same shape as a bundled catalog record. */
export function toRecord(row) {
  const genres = [...row.title_genres].sort((a, b) => a.position - b.position).map((g) => g.genres.name);

  const byRole = new Map();
  for (const c of [...row.credits].sort((a, b) => a.role_position - b.role_position || a.position - b.position)) {
    if (!byRole.has(c.role)) byRole.set(c.role, []);
    byRole.get(c.role).push(c.people.name);
  }
  const cast = byRole.get('Cast') ?? [];
  byRole.delete('Cast');
  const credits = [...byRole].map(([role, names]) => ({ role, names }));

  const record = {
    id: row.id,
    title: row.title,
    type: row.type,
    synopsis: row.synopsis,
    releaseYear: row.release_year,
    contentRating: row.content_rating,
    genres,
    credits,
    cast,
    heroPosition: row.hero_position ?? undefined,
    addedAt: row.created_at,
  };
  if (row.available_from) record.availableFrom = row.available_from;
  // Null in the database means "no official trailer"; a missing column means
  // the migration hasn't run yet, so fall back to the bundled key.
  const trailer = TRAILER_COLUMN in row ? row[TRAILER_COLUMN] : bundledTrailer(row.id);
  if (trailer) record.trailer = trailer;
  if (row.runtime_minutes) record.runtimeMinutes = row.runtime_minutes;
  if (row.cast_label) record.castLabel = row.cast_label;
  if (row.type === 'series') {
    record.seasons = row.seasons;
    record.episodeCount = row.episode_count;
    if (row.limited_series) record.limitedSeries = true;
    record.episodes = row.season_rows
      .flatMap((s) =>
        s.episodes.map((e) => ({
          season: s.season_number,
          episode: e.episode_number,
          title: e.name,
          runtimeMinutes: e.runtime_minutes,
          ...(e.synopsis ? { synopsis: e.synopsis } : {}),
          ...(e.still_path ? { still: e.still_path } : {}),
        })),
      )
      .sort((a, b) => a.season - b.season || a.episode - b.episode);
    if (record.episodes[0]) record.firstEpisode = { ...record.episodes[0] };
  }
  return record;
}

/**
 * Load the catalog from Supabase and swap it in. On any failure (no keys,
 * network error, timeout, bad data) the bundled catalog stays and this
 * resolves to the reason, so the site keeps working.
 */
export async function loadRemoteCatalog() {
  if (!supabase) return { ok: false, reason: 'Supabase is not configured' };
  try {
    const request = supabase
      .from('titles')
      .select(SELECT)
      .then((res) =>
        res.error?.message?.includes(TRAILER_COLUMN) ? supabase.from('titles').select(SELECT_WITHOUT_TRAILER) : res,
      );
    const timeout = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Timed out loading the catalog')), TIMEOUT_MS),
    );
    const { data, error } = await Promise.race([request, timeout]);
    if (error) throw error;

    const rows = [...data].sort((a, b) => TYPE_ORDER[a.type] - TYPE_ORDER[b.type] || a.sort_order - b.sort_order);
    const featured = rows.find((r) => r.is_featured);
    const problems = replaceCatalog(rows.map(toRecord), {
      featuredId: featured?.id ?? rows[0]?.id,
      source: 'supabase',
    });
    if (problems.length) throw new Error(`Catalog data problems: ${problems.join('; ')}`);
    return { ok: true };
  } catch (err) {
    if (import.meta.env.DEV) console.warn('[catalog] using the bundled catalog:', err.message);
    return { ok: false, reason: err.message };
  }
}
