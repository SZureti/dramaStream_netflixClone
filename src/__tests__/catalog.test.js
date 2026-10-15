import { describe, expect, it } from 'vitest';
import {
  LOCAL_CATALOG,
  getCatalog,
  getFeaturedTitle,
  getTitleById,
  getTitlesByType,
  replaceCatalog,
  searchCatalog,
  validateCatalog,
} from '../data/catalog.js';

describe('bundled catalog', () => {
  it('passes its own validation', () => {
    expect(validateCatalog()).toEqual([]);
  });

  it('has 10 titles of each type and a featured title from the catalog', () => {
    expect(getTitlesByType('film')).toHaveLength(10);
    expect(getTitlesByType('series')).toHaveLength(10);
    expect(getTitlesByType('documentary')).toHaveLength(10);
    expect(getFeaturedTitle().id).toBe('breaking-bad');
  });
});

describe('search (Story 3)', () => {
  it('matches partial, case-insensitive titles', () => {
    expect(searchCatalog('BREAK').map((t) => t.id)).toEqual(['breaking-bad']);
  });

  it('ignores accents and punctuation', () => {
    expect(searchCatalog('wont you').map((t) => t.id)).toEqual(['wont-you-be-my-neighbor']);
    expect(searchCatalog('schindlers').map((t) => t.id)).toEqual(['schindlers-list']);
  });

  it('returns nothing for a blank query or no match', () => {
    expect(searchCatalog('   ')).toEqual([]);
    expect(searchCatalog('zzzz')).toEqual([]);
  });
});

describe('replaceCatalog (Supabase copy)', () => {
  const plain = LOCAL_CATALOG.map(({ category, posterSrc, heroSrc, logoSrc, ...record }) => record);

  it('keeps the current catalog when the new data is broken', () => {
    const broken = plain.map((t) => (t.id === 'whiplash' ? { ...t, synopsis: '' } : t));
    const problems = replaceCatalog(broken, { featuredId: 'breaking-bad', source: 'supabase' });
    expect(problems).toContain('whiplash: missing synopsis');
    expect(getCatalog()).toBe(LOCAL_CATALOG);
  });

  it('swaps in valid data and follows its featured title', () => {
    const problems = replaceCatalog(plain, { featuredId: 'the-crown', source: 'supabase' });
    expect(problems).toEqual([]);
    expect(getFeaturedTitle().id).toBe('the-crown');
    expect(getTitleById('whiplash').posterSrc).toBe('/assets/posters/whiplash.jpg');
  });
});
