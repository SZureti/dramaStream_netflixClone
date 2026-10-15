import { afterEach, describe, expect, it } from 'vitest';
import {
  CATEGORIES,
  LOCAL_CATALOG,
  getCatalog,
  getEpisode,
  getFeaturedTitle,
  getNextEpisode,
  getPlayable,
  getTitleById,
  isAllowed,
  replaceCatalog,
  searchCatalog,
  searchRelated,
  setMaturityLimit,
} from '../data/catalog.js';
import { buildHomeRows, editorsOrder, similarTitles } from '../data/rows.js';
import { starsToRating } from '../state/ReviewsContext.jsx';
import { moodsFor } from '../data/moods.js';

afterEach(() => setMaturityLimit('all'));

describe('maturity limits (kids profiles)', () => {
  it('shows only titles at or below the level', () => {
    setMaturityLimit('older-kids');
    expect(getCatalog().map((t) => t.contentRating).sort()).toEqual(['PG', 'TV-PG']);
    expect(isAllowed(getTitleById('breaking-bad'))).toBe(false);
    // The featured title is TV-MA, so the billboard falls back to an allowed title.
    expect(isAllowed(getFeaturedTitle())).toBe(true);
  });

  it('keeps search inside the limit', () => {
    setMaturityLimit('teens');
    expect(searchCatalog('godfather')).toEqual([]);
    expect(searchCatalog('free solo').map((t) => t.id)).toEqual(['free-solo']);
  });
});

describe('search by people and genre', () => {
  it('finds titles by actor, director or genre, titles first', () => {
    expect(searchCatalog('cranston').map((t) => t.id)).toEqual(['breaking-bad']);
    expect(searchCatalog('gilligan').map((t) => t.id).sort()).toEqual(['better-call-saul', 'breaking-bad']);
    expect(searchCatalog('mystery').map((t) => t.id).sort()).toEqual(
      ['mare-of-easttown', 'the-leftovers', 'the-night-of', 'three-identical-strangers'].sort(),
    );
  });

  it('suggests related people and genres', () => {
    expect(searchRelated('gilligan')).toEqual(['Vince Gilligan']);
  });
});

describe('episodes', () => {
  const plain = LOCAL_CATALOG.map(({ category, posterSrc, posterSmallSrc, posterSrcSet, heroSrc, heroSmallSrc, heroSrcSet, episodes, ...r }) => r);
  const withEpisodes = plain.map((t) =>
    t.id === 'chernobyl'
      ? {
          ...t,
          episodes: [
            { season: 1, episode: 1, title: '1:23:45', runtimeMinutes: 61 },
            { season: 1, episode: 2, title: 'Please Remain Calm', runtimeMinutes: 65 },
          ],
        }
      : t,
  );

  it('finds a chosen episode and the one after it', () => {
    replaceCatalog(withEpisodes, { featuredId: 'breaking-bad', source: 'test' });
    const show = getTitleById('chernobyl');
    const ep2 = getEpisode(show, 1, 2);
    expect(ep2.title).toBe('Please Remain Calm');
    expect(getPlayable(show, ep2)).toMatchObject({ label: 'S1:E2', durationSeconds: 65 * 60 });
    expect(getNextEpisode(show, getEpisode(show, 1, 1))).toEqual(ep2);
    expect(getNextEpisode(show, ep2)).toBeNull();
  });

  it('falls back to the first episode for unknown numbers', () => {
    expect(getEpisode(getTitleById('chernobyl'), 9, 9).episode).toBe(1);
  });
});

describe('home rows', () => {
  const catalog = LOCAL_CATALOG;

  it('starts editors’ picks with the featured title and mixes types', () => {
    const picks = editorsOrder(catalog, 'breaking-bad');
    expect(picks[0].id).toBe('breaking-bad');
    expect(new Set(picks.slice(1, 4).map((t) => t.type)).size).toBe(3);
  });

  it('ranks Top 10 by activity, then fills with picks', () => {
    const activity = new Map([['icarus', { today: 5, week: 5 }]]);
    const rows = buildHomeRows({
      catalog,
      featuredId: 'breaking-bad',
      continueWatching: [],
      myList: [],
      activity,
      categories: CATEGORIES,
      continueHeading: 'Continue Watching',
    });
    const top10 = rows.find((r) => r.id === 'top-10');
    expect(top10.titles).toHaveLength(10);
    expect(top10.titles[0].id).toBe('icarus');
    expect(rows.map((r) => r.id)).not.toContain('continue-watching');
  });

  it('adds Because you watched from the most recent title', () => {
    const godfather = getTitleById('the-godfather');
    const rows = buildHomeRows({
      catalog,
      featuredId: 'breaking-bad',
      continueWatching: [{ title: godfather, progress: { position: 100, duration: 1000 } }],
      myList: [],
      activity: new Map(),
      categories: CATEGORIES,
      continueHeading: 'Continue Watching for Sam',
    });
    const because = rows.find((r) => r.id === 'because-you-watched');
    expect(because.heading).toBe('Because you watched The Godfather');
    expect(because.titles.every((t) => t.genres.includes('Crime') || t.type === 'film')).toBe(true);
    expect(similarTitles(godfather, catalog).map((t) => t.id)).not.toContain('the-godfather');
  });
});

describe('ratings and moods', () => {
  it('converts old star ratings to Netflix’s three options', () => {
    expect([1, 2, 3, 4, 5, null].map(starsToRating)).toEqual(['not-for-me', 'not-for-me', 'like', 'like', 'love', null]);
  });

  it('derives mood tags from genres', () => {
    expect(moodsFor(getTitleById('breaking-bad'))).toEqual(['Gritty', 'Suspenseful']);
    expect(moodsFor(getTitleById('moonlight'))).toEqual(['Emotional', 'Intimate']);
  });
});
