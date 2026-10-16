import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { getTitleById } from '../data/catalog.js';
import { supabase } from '../lib/supabase.js';
import { readJSON, removeKey, writeJSON } from '../lib/storage.js';
import { useProfiles } from './ProfileContext.jsx';
import { useStatus } from './StatusContext.jsx';

const GUEST_KEY = 'dramastream:ratings:v2';
const OLD_STARS_KEY = 'dramastream:reviews:v1';
const ReviewsContext = createContext(null);

/** Netflix's three ratings, lowest first. */
export const RATINGS = [
  { value: 'not-for-me', label: 'Not for me', mine: 'You rated this Not for me' },
  { value: 'like', label: 'I like this', mine: 'You like this' },
  { value: 'love', label: 'Love this!', mine: 'You love this' },
];
export const ratingLabel = (value) => RATINGS.find((r) => r.value === value)?.label ?? null;

/** 1–2 stars → Not for me, 3–4 → I like this, 5 → Love this. */
export function starsToRating(stars) {
  if (!stars) return null;
  if (stars <= 2) return 'not-for-me';
  return stars >= 5 ? 'love' : 'like';
}

/** Shape: { [titleId]: { myRating: 'not-for-me' | 'like' | 'love' | null, reviews: Review[] } } */
function loadGuest() {
  const data = readJSON(GUEST_KEY, null);
  if (data && typeof data === 'object') return data;
  // First visit since ratings changed: convert the old star ratings once.
  const old = readJSON(OLD_STARS_KEY, {});
  const converted = {};
  for (const [id, entry] of Object.entries(old && typeof old === 'object' ? old : {})) {
    converted[id] = {
      myRating: starsToRating(entry?.myRating),
      reviews: (entry?.reviews ?? []).map((r) => ({ ...r, rating: starsToRating(r.rating) ?? 'like' })),
    };
  }
  return converted;
}

let nextId = Date.now();

/**
 * Ratings and reviews. Signed out, they're saved in this browser. Signed in,
 * they belong to the chosen profile in Supabase (tables ratings and reviews)
 * and are private to the account. A guest's ratings move into the first
 * profile chosen.
 */
export function ReviewsProvider({ children }) {
  const { current } = useProfiles();
  const { announce } = useStatus();
  const [byTitle, setByTitle] = useState(loadGuest);
  const profileId = current?.id ?? null;
  const profileRef = useRef(profileId);
  profileRef.current = profileId;

  useEffect(() => {
    if (!profileId || !supabase) {
      setByTitle(loadGuest());
      return undefined;
    }
    let cancelled = false;
    (async () => {
      const [ratings, reviews] = await Promise.all([
        supabase.from('ratings').select('title_id, value').eq('profile_id', profileId),
        supabase
          .from('reviews')
          .select('id, title_id, rating, body, created_at')
          .eq('profile_id', profileId)
          .order('created_at', { ascending: false }),
      ]);
      if (cancelled) return;
      if (ratings.error || reviews.error) {
        announce('Couldn’t load your ratings.');
        return;
      }
      const next = {};
      const slot = (id) => (next[id] ??= { myRating: null, reviews: [] });
      for (const r of ratings.data) slot(r.title_id).myRating = r.value;
      for (const r of reviews.data) {
        slot(r.title_id).reviews.push({
          id: r.id,
          name: current.name,
          rating: r.rating,
          text: r.body,
          createdAt: r.created_at,
        });
      }

      // Move guest ratings and reviews into this profile (ratings only where it has none).
      const guest = loadGuest();
      const ratingRows = Object.entries(guest)
        .filter(([id, e]) => e.myRating && !next[id]?.myRating && getTitleById(id))
        .map(([id, e]) => ({ profile_id: profileId, title_id: id, value: e.myRating }));
      const reviewRows = Object.entries(guest)
        .filter(([id]) => getTitleById(id))
        .flatMap(([id, e]) =>
          (e.reviews ?? [])
            .filter((r) => r.text?.trim().length >= 10)
            .map((r) => ({ profile_id: profileId, title_id: id, rating: r.rating, body: r.text.trim().slice(0, 600) })),
        );
      if (ratingRows.length || reviewRows.length) {
        const results = await Promise.all([
          ratingRows.length ? supabase.from('ratings').upsert(ratingRows) : { error: null },
          reviewRows.length
            ? supabase.from('reviews').insert(reviewRows).select('id, title_id, rating, body, created_at')
            : { error: null, data: [] },
        ]);
        if (!results[0].error && !results[1].error) {
          for (const r of ratingRows) slot(r.title_id).myRating = r.value;
          for (const r of results[1].data ?? []) {
            slot(r.title_id).reviews.unshift({
              id: r.id,
              name: current.name,
              rating: r.rating,
              text: r.body,
              createdAt: r.created_at,
            });
          }
          removeKey(GUEST_KEY);
          removeKey(OLD_STARS_KEY);
        }
      } else {
        removeKey(GUEST_KEY);
      }
      if (!cancelled) setByTitle(next);
    })();
    return () => {
      cancelled = true;
    };
    // current.name only labels reviews; the profile id decides when to reload.
  }, [profileId, announce]);

  useEffect(() => {
    if (!profileId) writeJSON(GUEST_KEY, byTitle);
  }, [byTitle, profileId]);

  const entry = useCallback((id) => byTitle[id] ?? { myRating: null, reviews: [] }, [byTitle]);

  const setEntry = (id, update) =>
    setByTitle((all) => ({ ...all, [id]: update(all[id] ?? { myRating: null, reviews: [] }) }));

  const rate = useCallback(
    async (id, value) => {
      const t = getTitleById(id);
      const before = byTitle[id]?.myRating ?? null;
      setEntry(id, (e) => ({ ...e, myRating: value }));
      announce(value ? `Rated “${t?.title}”: ${ratingLabel(value)}` : `Removed your rating for “${t?.title}”`);
      if (!profileRef.current || !supabase) return;
      const { error } = value
        ? await supabase
            .from('ratings')
            .upsert({ profile_id: profileRef.current, title_id: id, value, updated_at: new Date().toISOString() })
        : await supabase.from('ratings').delete().eq('profile_id', profileRef.current).eq('title_id', id);
      if (error) {
        setEntry(id, (e) => ({ ...e, myRating: before }));
        announce('Couldn’t save your rating. Try again.');
      }
    },
    [announce, byTitle],
  );

  const addReview = useCallback(
    async (id, { name, rating, text }) => {
      const body = text.trim();
      if (profileRef.current && supabase) {
        const { data, error } = await supabase
          .from('reviews')
          .insert({ profile_id: profileRef.current, title_id: id, rating, body })
          .select('id, created_at')
          .single();
        if (error) {
          announce('Couldn’t post your review. Try again.');
          return false;
        }
        await supabase.from('ratings').upsert({ profile_id: profileRef.current, title_id: id, value: rating });
        const review = { id: data.id, name: current?.name ?? 'You', rating, text: body, createdAt: data.created_at };
        setEntry(id, (e) => ({ ...e, myRating: rating, reviews: [review, ...e.reviews] }));
      } else {
        const review = {
          id: String(nextId++),
          name: name.trim() || 'Anonymous viewer',
          rating,
          text: body,
          createdAt: new Date().toISOString(),
        };
        setEntry(id, (e) => ({ ...e, myRating: rating, reviews: [review, ...e.reviews] }));
      }
      announce('Review posted');
      return true;
    },
    [announce, current?.name],
  );

  const removeReview = useCallback(
    async (id, reviewId) => {
      const removed = byTitle[id]?.reviews.find((r) => r.id === reviewId);
      setEntry(id, (e) => ({ ...e, reviews: e.reviews.filter((r) => r.id !== reviewId) }));
      announce('Review deleted');
      if (!profileRef.current || !supabase || !removed) return;
      const { error } = await supabase.from('reviews').delete().eq('id', reviewId);
      if (error) {
        setEntry(id, (e) => ({ ...e, reviews: [removed, ...e.reviews] }));
        announce('Couldn’t delete that review. Try again.');
      }
    },
    [announce, byTitle],
  );

  /** Your rating, your reviews, and how the reviews' ratings break down. */
  const summary = useCallback(
    (id) => {
      const { myRating, reviews } = entry(id);
      const counts = { 'not-for-me': 0, like: 0, love: 0 };
      for (const r of reviews) counts[r.rating] = (counts[r.rating] ?? 0) + 1;
      return { myRating, reviews, counts, count: reviews.length };
    },
    [entry],
  );

  // Every rating this viewer has given, in the order they were stored (for % Match).
  const ratings = useMemo(
    () =>
      new Map(
        Object.entries(byTitle)
          .filter(([, e]) => e.myRating)
          .map(([id, e]) => [id, e.myRating]),
      ),
    [byTitle],
  );

  const value = useMemo(
    () => ({ summary, rate, addReview, removeReview, ratings, inAccount: Boolean(profileId) }),
    [summary, rate, addReview, removeReview, ratings, profileId],
  );
  return <ReviewsContext.Provider value={value}>{children}</ReviewsContext.Provider>;
}

export function useReviews() {
  const ctx = useContext(ReviewsContext);
  if (!ctx) throw new Error('useReviews must be used inside <ReviewsProvider>');
  return ctx;
}
