import { describe, expect, it } from 'vitest';
import { tmdbAuth, trimResults } from '../../supabase/functions/tmdb-search/trim.ts';
import { withoutCatalogTitles } from '../data/tmdb.js';

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
