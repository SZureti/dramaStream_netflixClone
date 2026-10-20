import { supabase } from '../lib/supabase.js';

/** True when the site is connected to Supabase, so tmdb-search can be called. */
export const tmdbAvailable = Boolean(supabase);

/**
 * Live TMDB search through the `tmdb-search` Edge Function. The TMDB key lives
 * in Supabase secrets, so the browser only ever talks to our own function.
 * Resolves to [{ id, type, title, year, overview, poster, rating }].
 */
export async function searchTmdb(query) {
  if (!supabase) return [];
  const { data, error } = await supabase.functions.invoke('tmdb-search', { body: { q: query } });
  if (error) throw error;
  return Array.isArray(data?.results) ? data.results : [];
}

const norm = (s) =>
  s
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .trim();

/** Drops TMDB hits whose title is already in our own catalog results. */
export function withoutCatalogTitles(hits, catalogTitles) {
  const known = new Set(catalogTitles.map((t) => norm(t.title)));
  return hits.filter((h) => !known.has(norm(h.title)));
}
