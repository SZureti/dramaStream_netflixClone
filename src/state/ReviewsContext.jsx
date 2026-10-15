import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { getTitleById } from '../data/catalog.js';
import { useStatus } from './StatusContext.jsx';

const STORAGE_KEY = 'dramastream:reviews:v1';
const ReviewsContext = createContext(null);

/** Shape: { [titleId]: { myRating: 1–5 | null, reviews: Review[] } } */
function load() {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    const data = raw ? JSON.parse(raw) : {};
    return data && typeof data === 'object' ? data : {};
  } catch {
    return {};
  }
}

let nextId = Date.now();

/**
 * Ratings and reviews live in this browser only (localStorage), so they
 * survive a refresh but are never sent anywhere. No accounts, no server.
 */
export function ReviewsProvider({ children }) {
  const [byTitle, setByTitle] = useState(load);
  const { announce } = useStatus();

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(byTitle));
    } catch {
      /* storage unavailable (private mode) — keep working in memory */
    }
  }, [byTitle]);

  const entry = useCallback((id) => byTitle[id] ?? { myRating: null, reviews: [] }, [byTitle]);

  const rate = useCallback(
    (id, stars) => {
      setByTitle((all) => ({ ...all, [id]: { ...(all[id] ?? { reviews: [] }), myRating: stars } }));
      const t = getTitleById(id);
      announce(stars ? `You rated “${t?.title}” ${stars} out of 5` : `Removed your rating for “${t?.title}”`);
    },
    [announce],
  );

  const addReview = useCallback(
    (id, { name, rating, text }) => {
      const review = {
        id: String(nextId++),
        name: name.trim() || 'Anonymous viewer',
        rating,
        text: text.trim(),
        createdAt: new Date().toISOString(),
      };
      setByTitle((all) => {
        const cur = all[id] ?? { myRating: null, reviews: [] };
        return { ...all, [id]: { ...cur, myRating: rating, reviews: [review, ...cur.reviews] } };
      });
      announce('Review posted');
    },
    [announce],
  );

  const removeReview = useCallback(
    (id, reviewId) => {
      setByTitle((all) => {
        const cur = all[id];
        if (!cur) return all;
        return { ...all, [id]: { ...cur, reviews: cur.reviews.filter((r) => r.id !== reviewId) } };
      });
      announce('Review deleted');
    },
    [announce],
  );

  /** Average of posted review ratings (plus your own rating if you haven't reviewed). */
  const summary = useCallback(
    (id) => {
      const { myRating, reviews } = entry(id);
      const ratings = reviews.map((r) => r.rating);
      if (myRating && !reviews.length) ratings.push(myRating);
      const count = ratings.length;
      const average = count ? ratings.reduce((a, b) => a + b, 0) / count : null;
      return { average, count, myRating, reviews };
    },
    [entry],
  );

  const value = useMemo(() => ({ summary, rate, addReview, removeReview }), [summary, rate, addReview, removeReview]);
  return <ReviewsContext.Provider value={value}>{children}</ReviewsContext.Provider>;
}

export function useReviews() {
  const ctx = useContext(ReviewsContext);
  if (!ctx) throw new Error('useReviews must be used inside <ReviewsProvider>');
  return ctx;
}
