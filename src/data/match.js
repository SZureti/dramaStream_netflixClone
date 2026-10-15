// Netflix-style "% Match": how close a title is to what this viewer rated.
// Built only from the viewer's own ratings (Love / Like pull towards similar
// titles, Not for me pushes away), so there's no match until they rate something.

const BROAD = new Set(['Drama', 'Documentary']);

/** 0–1: shared specific genres (Jaccard), plus a little for the same type. */
export function similarity(a, b) {
  const ga = new Set(a.genres.filter((g) => !BROAD.has(g)));
  const gb = b.genres.filter((g) => !BROAD.has(g));
  const union = new Set([...ga, ...gb]).size;
  const shared = gb.filter((g) => ga.has(g)).length;
  return 0.7 * (union ? shared / union : 0) + 0.3 * (a.type === b.type ? 1 : 0);
}

const WEIGHT = { love: 1, like: 0.75 };

/**
 * @param title    the title to score
 * @param ratings  Map(titleId → 'love' | 'like' | 'not-for-me') of the viewer's ratings
 * @param lookup   (id) → title
 * @returns a whole-number percentage (50–98), or null with no ratings or for a title already rated
 */
export function matchPercent(title, ratings, lookup) {
  if (!ratings.size || ratings.has(title.id)) return null;
  let pull = 0;
  let push = 0;
  for (const [id, value] of ratings) {
    const other = lookup(id);
    if (!other) continue;
    const s = similarity(title, other);
    if (value === 'not-for-me') push = Math.max(push, s);
    else pull = Math.max(pull, s * WEIGHT[value]);
  }
  return Math.round(Math.min(98, Math.max(50, 64 + 34 * pull - 26 * push)));
}

/** The title the viewer most recently loved (else liked), for "Because you liked…". */
export function favouriteTitle(ratings, lookup) {
  const entries = [...ratings].reverse();
  const pick = entries.find(([, v]) => v === 'love') ?? entries.find(([, v]) => v === 'like');
  return pick ? lookup(pick[0]) : null;
}
