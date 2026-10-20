import { describe, expect, it } from 'vitest';
import { tmdbAuth, trimResults } from '../../supabase/functions/tmdb-search/trim.ts';
import { trimDetails } from '../../supabase/functions/tmdb-details/trim.ts';
import { trimPerson } from '../../supabase/functions/tmdb-person/trim.ts';
import { LOCAL_CATALOG, setMaturityLimit } from '../data/catalog.js';
import { TMDB_IDS, tmdbRefFor } from '../data/tmdbIds.js';
import { formatDate, formatMinutes, tmdbAllowedForProfile, withoutCatalogTitles } from '../data/tmdb.js';

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
      cast: Array.from({ length: 20 }, (_, i) => ({ id: 1000 + i, name: `Actor ${i}`, character: `Role ${i}`, profile_path: i ? null : '/a.jpg' })),
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
    expect(d.cast[0]).toEqual({ id: 1000, name: 'Actor 0', character: 'Role 0', photo: 'https://image.tmdb.org/t/p/w185/a.jpg' });
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

describe('tmdb-person trimPerson', () => {
  const credit = (over) => ({
    id: 1,
    media_type: 'movie',
    title: 'A Film',
    release_date: '2010-01-01',
    character: 'Someone',
    popularity: 10,
    poster_path: '/x.jpg',
    vote_average: 7.26,
    vote_count: 100,
    genre_ids: [18],
    ...over,
  });
  const raw = {
    id: 17419,
    name: 'Bryan Cranston',
    profile_path: '/bc.jpg',
    biography: 'An actor.',
    birthday: '1956-03-07',
    deathday: null,
    place_of_birth: 'Hollywood, California, USA',
    known_for_department: 'Acting',
    combined_credits: {
      cast: [
        credit({ id: 1, title: 'Low', popularity: 1 }),
        credit({ id: 2, title: 'High', popularity: 99 }),
        credit({ id: 2, title: 'High again', popularity: 98 }), // same id: dropped
        credit({ id: 3, media_type: 'tv', title: undefined, release_date: undefined, name: 'A Series', first_air_date: '2008-01-20', popularity: 50 }),
        credit({ id: 4, title: 'Talk Show Guest', genre_ids: [10767], popularity: 500 }),
        credit({ id: 5, title: 'Documentary', character: 'Himself', popularity: 400 }),
        { id: 6, media_type: 'person', name: 'Nope' },
      ],
    },
  };

  it('builds the profile with image URLs', () => {
    expect(trimPerson(raw)).toMatchObject({
      id: 17419,
      name: 'Bryan Cranston',
      photo: 'https://image.tmdb.org/t/p/w342/bc.jpg',
      biography: 'An actor.',
      birthday: '1956-03-07',
      deathday: null,
      birthplace: 'Hollywood, California, USA',
      knownFor: 'Acting',
    });
  });

  it('keeps acting credits by popularity, dropping talk shows, self roles and duplicates', () => {
    const titles = trimPerson(raw).credits.map((c) => c.title);
    expect(titles).toEqual(['High', 'A Series', 'Low']);
    expect(trimPerson(raw).credits[1]).toMatchObject({ type: 'tv', year: 2008, character: 'Someone', rating: 7.3 });
  });

  it('caps credits at 20, clips long biographies, and tolerates an empty payload', () => {
    const many = { ...raw, biography: 'x'.repeat(5000), combined_credits: { cast: Array.from({ length: 40 }, (_, i) => credit({ id: i })) } };
    expect(trimPerson(many).credits).toHaveLength(20);
    expect(trimPerson(many).biography.length).toBeLessThanOrEqual(1500);
    expect(trimPerson({})).toMatchObject({ name: '', photo: null, birthday: null, credits: [] });
  });
});

describe('formatDate', () => {
  it('formats TMDB dates without time-zone drift', () => {
    expect(formatDate('1956-03-07')).toBe('March 7, 1956');
    expect(formatDate(null)).toBe('');
    expect(formatDate('nope')).toBe('');
  });
});

describe('catalog to TMDB ids', () => {
  it('has a movie or tv id for every catalog title', () => {
    for (const t of LOCAL_CATALOG) {
      const ref = tmdbRefFor(t.id);
      expect(ref, t.id).toBeTruthy();
      expect(['movie', 'tv']).toContain(ref.type);
      expect(Number.isInteger(ref.id) && ref.id > 0, t.id).toBe(true);
    }
  });

  it('matches the title type: series are tv, films and documentaries are movies', () => {
    for (const t of LOCAL_CATALOG) {
      expect(tmdbRefFor(t.id).type, t.id).toBe(t.type === 'series' ? 'tv' : 'movie');
    }
  });

  it('maps no two titles to the same TMDB entry, and nothing extra', () => {
    const keys = Object.values(TMDB_IDS).map((r) => `${r.type}/${r.id}`);
    expect(new Set(keys).size).toBe(keys.length);
    expect(Object.keys(TMDB_IDS).sort()).toEqual(LOCAL_CATALOG.map((t) => t.id).sort());
    expect(tmdbRefFor('not-a-title')).toBeNull();
  });
});
