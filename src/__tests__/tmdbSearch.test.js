import { describe, expect, it } from 'vitest';
import { tmdbAuth, trimResults } from '../../supabase/functions/tmdb-search/trim.ts';
import { trimDetails } from '../../supabase/functions/tmdb-details/trim.ts';
import { setMaturityLimit } from '../data/catalog.js';
import { formatMinutes, tmdbAllowedForProfile, withoutCatalogTitles } from '../data/tmdb.js';

const movie = {
  id: 1,
  media_type: 'movie',
  title: 'Parasite',
  release_date: '2019-05-30',
  overview: 'A struggling family schemes.',
  poster_path: '/abc.jpg',
  vote_average: 8.5123,
  vote_count: 500,
};

describe('tmdb-search trimResults', () => {
  it('keeps only the fields the site shows', () => {
    expect(trimResults({ results: [movie] })).toEqual([
      {
        id: 1,
        type: 'movie',
        title: 'Parasite',
        year: 2019,
        overview: 'A struggling family schemes.',
        poster: 'https://image.tmdb.org/t/p/w342/abc.jpg',
        rating: 8.5,
      },
    ]);
  });

  it('maps TV names and first_air_date, and skips people', () => {
    const out = trimResults({
      results: [
        { id: 2, media_type: 'tv', name: 'Succession', first_air_date: '2018-06-03', overview: '', vote_count: 0 },
        { id: 3, media_type: 'person', name: 'Someone' },
      ],
    });
    expect(out).toHaveLength(1);
    expect(out[0]).toMatchObject({ type: 'tv', title: 'Succession', year: 2018, poster: null, rating: null });
  });

  it('clips long overviews, caps at 12, and tolerates junk', () => {
    const long = { ...movie, overview: 'x'.repeat(500) };
    expect(trimResults({ results: [long] })[0].overview.length).toBeLessThanOrEqual(220);
    expect(trimResults({ results: Array.from({ length: 30 }, (_, i) => ({ ...movie, id: i })) })).toHaveLength(12);
    expect(trimResults(null)).toEqual([]);
    expect(trimResults({ results: 'nope' })).toEqual([]);
  });
});

describe('tmdb-search tmdbAuth', () => {
  it('sends a v3 key as a query parameter', () => {
    expect(tmdbAuth('abc123')).toEqual({ headers: {}, param: '&api_key=abc123' });
  });
  it('sends a v4 read token as a Bearer header', () => {
    expect(tmdbAuth('eyJhbGciOi.x.y')).toEqual({ headers: { Authorization: 'Bearer eyJhbGciOi.x.y' }, param: '' });
  });
});

describe('withoutCatalogTitles', () => {
  it('drops TMDB hits already in the catalog, ignoring case and accents', () => {
    const hits = [{ title: 'Parasite' }, { title: 'AMÉLIE' }, { title: 'New Show' }];
    const catalog = [{ title: 'parasite' }, { title: 'Amelie' }];
    expect(withoutCatalogTitles(hits, catalog)).toEqual([{ title: 'New Show' }]);
  });
});

describe('tmdb-details trimDetails', () => {
  const film = {
    id: 496243,
    title: 'Parasite',
    tagline: 'Act like you own the place.',
    release_date: '2019-05-30',
    overview: 'A family schemes.',
    genres: [{ name: 'Comedy' }, { name: 'Thriller' }],
    runtime: 133,
    status: 'Released',
    vote_average: 8.5123,
    vote_count: 20000,
    poster_path: '/p.jpg',
    backdrop_path: '/b.jpg',
    credits: {
      crew: [
        { job: 'Director', name: 'Bong Joon Ho' },
        { job: 'Producer', name: 'Someone Else' },
      ],
      cast: Array.from({ length: 20 }, (_, i) => ({ name: `Actor ${i}`, character: `Role ${i}`, profile_path: i ? null : '/a.jpg' })),
    },
  };

  it('shapes a film: directors only, cast capped at 12, image URLs built', () => {
    const d = trimDetails('movie', film);
    expect(d).toMatchObject({
      id: 496243,
      type: 'movie',
      title: 'Parasite',
      year: 2019,
      genres: ['Comedy', 'Thriller'],
      runtime: 133,
      seasons: null,
      rating: 8.5,
      poster: 'https://image.tmdb.org/t/p/w500/p.jpg',
      backdrop: 'https://image.tmdb.org/t/p/w780/b.jpg',
      directors: ['Bong Joon Ho'],
    });
    expect(d.cast).toHaveLength(12);
    expect(d.cast[0]).toEqual({ name: 'Actor 0', character: 'Role 0', photo: 'https://image.tmdb.org/t/p/w185/a.jpg' });
    expect(d.cast[1].photo).toBeNull();
  });

  it('shapes a series: creators, seasons, episode runtime', () => {
    const d = trimDetails('tv', {
      id: 76331,
      name: 'Succession',
      first_air_date: '2018-06-03',
      created_by: [{ name: 'Jesse Armstrong' }],
      episode_run_time: [60],
      number_of_seasons: 4,
      number_of_episodes: 39,
      vote_count: 0,
    });
    expect(d).toMatchObject({
      title: 'Succession',
      year: 2018,
      directors: ['Jesse Armstrong'],
      runtime: 60,
      seasons: 4,
      episodes: 39,
      rating: null,
      cast: [],
    });
  });

  it('tolerates a nearly empty payload', () => {
    expect(trimDetails('movie', {})).toMatchObject({ title: '', year: null, genres: [], cast: [], directors: [], runtime: null });
  });
});

describe('formatMinutes', () => {
  it('formats runtimes', () => {
    expect(formatMinutes(133)).toBe('2h 13m');
    expect(formatMinutes(120)).toBe('2h');
    expect(formatMinutes(45)).toBe('45 min');
    expect(formatMinutes(null)).toBe('');
  });
});

describe('tmdbAllowedForProfile', () => {
  it('is on for unrestricted profiles and off for Kids profiles', () => {
    setMaturityLimit('all');
    expect(tmdbAllowedForProfile()).toBe(true);
    setMaturityLimit('little-kids');
    expect(tmdbAllowedForProfile()).toBe(false);
    setMaturityLimit('older-kids');
    expect(tmdbAllowedForProfile()).toBe(false);
    setMaturityLimit('all');
  });
});
