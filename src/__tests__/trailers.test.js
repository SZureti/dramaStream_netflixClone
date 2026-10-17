import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { LOCAL_CATALOG } from '../data/catalog.js';
import { toRecord } from '../data/remoteCatalog.js';
import { trailerEmbedUrl } from '../components/TrailerButton.jsx';

const research = JSON.parse(readFileSync(new URL('../../supabase/seed/trailers-research.json', import.meta.url), 'utf8'));
const YOUTUBE_KEY = /^[A-Za-z0-9_-]{11}$/;

const row = (extra) => ({
  id: 'parasite',
  title: 'Parasite',
  type: 'film',
  synopsis: 'A struggling family…',
  release_year: 2019,
  content_rating: 'R',
  runtime_minutes: 133,
  title_genres: [],
  credits: [],
  ...extra,
});

describe('trailers in the bundled catalog', () => {
  it('uses well-formed YouTube keys', () => {
    for (const t of LOCAL_CATALOG.filter((t) => t.trailer)) expect(t.trailer, t.id).toMatch(YOUTUBE_KEY);
  });

  it('matches the TMDB research file, title by title', () => {
    const fromResearch = Object.fromEntries(research.titles.map((r) => [r.id, r.youtubeKey ?? undefined]));
    expect(Object.keys(fromResearch).sort()).toEqual(LOCAL_CATALOG.map((t) => t.id).sort());
    for (const t of LOCAL_CATALOG) expect(t.trailer, t.id).toBe(fromResearch[t.id]);
  });

  it('gives Coming Soon titles a trailer too', () => {
    const comingSoon = LOCAL_CATALOG.filter((t) => t.availableFrom);
    expect(comingSoon.length).toBeGreaterThan(0);
    for (const t of comingSoon) expect(t.trailer, t.id).toMatch(YOUTUBE_KEY);
  });
});

describe('toRecord: trailer_youtube_key', () => {
  it('maps the column to record.trailer', () => {
    expect(toRecord(row({ trailer_youtube_key: 'isOGD_7hNIY' })).trailer).toBe('isOGD_7hNIY');
  });

  it('leaves trailer off when the column is null (no official trailer)', () => {
    expect(toRecord(row({ trailer_youtube_key: null }))).not.toHaveProperty('trailer');
  });

  it('falls back to the bundled key when the column does not exist yet', () => {
    const bundled = LOCAL_CATALOG.find((t) => t.id === 'parasite').trailer;
    expect(toRecord(row()).trailer).toBe(bundled);
  });
});

describe('trailerEmbedUrl', () => {
  it('uses the privacy-enhanced YouTube host and plays inline', () => {
    const url = new URL(trailerEmbedUrl('isOGD_7hNIY'));
    expect(url.origin).toBe('https://www.youtube-nocookie.com');
    expect(url.pathname).toBe('/embed/isOGD_7hNIY');
    expect(url.searchParams.get('autoplay')).toBe('1');
    expect(url.searchParams.get('playsinline')).toBe('1');
  });
});
