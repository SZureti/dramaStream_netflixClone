import { supabase } from '../lib/supabase.js';
import { isAllowed } from './catalog.js';

/** True when the site is connected to Supabase, so tmdb-search can be called. */
export const tmdbAvailable = Boolean(supabase);

/**
 * TMDB titles carry no DramaStream maturity rating, and the site treats unrated
 * titles as adult, so restricted (Kids) profiles don't get TMDB content at all.
 */
export const tmdbAllowedForProfile = () => isAllowed({});

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

// One request per title for the life of the page: the modal, the details page and
// React's dev double-render all share it.
const detailsCache = new Map();

/**
 * Full details (overview, genres, cast) for one TMDB title, via the
 * `tmdb-details` Edge Function. `type` is 'movie' or 'tv'. Resolves to the
 * details object; rejects when TMDB doesn't know the id or the call fails.
 */
export function getTmdbDetails(type, id) {
  if (!supabase) return Promise.reject(new Error('Not connected to Supabase'));
  const key = `${type}/${id}`;
  if (!detailsCache.has(key)) {
    const request = supabase.functions
      .invoke('tmdb-details', { body: { type, id } })
      .then(({ data, error }) => {
        if (error) throw error;
        if (!data?.details) throw new Error('No details returned');
        return data.details;
      })
      // A failed lookup isn't remembered, so a later visit can try again.
      .catch((err) => {
        detailsCache.delete(key);
        throw err;
      });
    detailsCache.set(key, request);
  }
  return detailsCache.get(key);
}

/**
 * An actor's profile and best-known films and series, via the `tmdb-person`
 * Edge Function. Resolves to the person object; rejects when TMDB doesn't know
 * the id or the call fails.
 */
export async function getTmdbPerson(id) {
  if (!supabase) throw new Error('Not connected to Supabase');
  const { data, error } = await supabase.functions.invoke('tmdb-person', { body: { id } });
  if (error) throw error;
  if (!data?.person) throw new Error('No person returned');
  return data.person;
}

/** "March 27, 1958" from TMDB's YYYY-MM-DD, or '' when missing. */
export function formatDate(iso) {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso ?? '');
  if (!m) return '';
  const date = new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
  return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
}

/** "2h 13m" / "58 min" from minutes, or '' when unknown. */
export function formatMinutes(min) {
  if (!min) return '';
  const h = Math.floor(min / 60);
  const m = min % 60;
  return h ? `${h}h${m ? ` ${m}m` : ''}` : `${m} min`;
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
