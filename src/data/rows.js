// Builds the Home page rows, Netflix-style. Pure functions (no React, no
// network) so they're easy to test; HomePage passes in what it knows.

const ROW_SIZE = 10;
// Genres too broad to make an interesting row in a drama catalog.
const BROAD_GENRES = new Set(['Drama', 'Documentary']);

/** Rank by a score, then fill up with the editors' order so a row is never short. */
function rankWithFallback(titles, score, editorsOrder) {
  const scored = titles.filter((t) => score(t) > 0).sort((a, b) => score(b) - score(a));
  const rest = editorsOrder.filter((t) => !scored.includes(t));
  return [...scored, ...rest].slice(0, ROW_SIZE);
}

/** Editors' picks: the featured title first, then one of each type in turn. */
export function editorsOrder(catalog, featuredId) {
  const byType = ['series', 'film', 'documentary'].map((type) => catalog.filter((t) => t.type === type));
  const mixed = [];
  for (let i = 0; byType.some((list) => i < list.length); i += 1) {
    for (const list of byType) if (list[i]) mixed.push(list[i]);
  }
  const featured = mixed.find((t) => t.id === featuredId);
  return featured ? [featured, ...mixed.filter((t) => t !== featured)] : mixed;
}

/** Titles most like `seed`: shared specific genres first, then the same type. */
export function similarTitles(seed, catalog, limit = ROW_SIZE) {
  const seedGenres = new Set(seed.genres.filter((g) => !BROAD_GENRES.has(g)));
  const score = (t) => t.genres.filter((g) => seedGenres.has(g)).length * 2 + (t.type === seed.type ? 1 : 0);
  return catalog
    .filter((t) => t.id !== seed.id && score(t) > 0)
    .sort((a, b) => score(b) - score(a))
    .slice(0, limit);
}

/**
 * Everything Home shows below the billboard, in Netflix's order. Each row is
 * { id, heading, titles, kind? } and empty rows are left out.
 *   catalog          titles this profile may see
 *   continueWatching [{ title, progress }] (already filtered)
 *   myList           titles
 *   activity         Map(titleId → { today, week }) from fetchActivity
 *   categories       CATEGORIES from catalog.js
 */
export function buildHomeRows({
  catalog,
  featuredId,
  continueWatching,
  myList,
  activity,
  categories,
  continueHeading,
  liked = null, // a title the viewer loved or liked
  rated = new Set(), // ids the viewer already rated (left out of "Because you liked")
}) {
  const picks = editorsOrder(catalog, featuredId);
  const score = (key) => (t) => activity.get(t.id)?.[key] ?? 0;
  const rows = [];

  if (continueWatching.length) {
    rows.push({
      id: 'continue-watching',
      heading: continueHeading,
      titles: continueWatching.map((c) => c.title),
      kind: 'progress',
    });
  }
  const top10 = rankWithFallback(catalog, score('today'), picks);
  if (top10.length >= 3)
    rows.push({ id: 'top-10', heading: 'Top 10 on DramaStream Today', titles: top10, kind: 'ranked' });
  if (myList.length) rows.push({ id: 'my-list', heading: 'My List', titles: myList });

  // Trending: this week's activity, then picks that aren't already in the Top 10.
  const trendingFallback = [...picks.filter((t) => !top10.includes(t)), ...top10];
  rows.push({
    id: 'trending',
    heading: 'Trending Now',
    titles: rankWithFallback(catalog, score('week'), trendingFallback),
  });

  rows.push({
    id: 'new-releases',
    heading: 'New Releases',
    titles: [...catalog].sort((a, b) => b.releaseYear - a.releaseYear).slice(0, ROW_SIZE),
  });

  const lastWatched = continueWatching[0]?.title;
  if (lastWatched) {
    const similar = similarTitles(lastWatched, catalog);
    if (similar.length >= 3)
      rows.push({ id: 'because-you-watched', heading: `Because you watched ${lastWatched.title}`, titles: similar });
  }

  if (liked && liked.id !== lastWatched?.id) {
    const similar = similarTitles(liked, catalog).filter((t) => !rated.has(t.id));
    if (similar.length >= 3) {
      rows.push({ id: 'because-you-liked', heading: `Because you liked ${liked.title}`, titles: similar });
    }
  }

  const genres = [...new Set(catalog.flatMap((t) => t.genres))].filter((g) => !BROAD_GENRES.has(g)).sort();
  for (const genre of genres) {
    const titles = catalog.filter((t) => t.genres.includes(genre));
    if (titles.length >= 4) rows.push({ id: `genre-${genre.toLowerCase()}`, heading: `${genre} Dramas`, titles });
  }

  for (const c of categories) {
    const titles = catalog.filter((t) => t.type === c.type);
    if (titles.length) rows.push({ id: c.anchor, heading: c.title, blurb: c.blurb, titles });
  }

  return rows.filter((r) => r.titles.length > 0);
}
