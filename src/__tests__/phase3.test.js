import { describe, expect, it } from 'vitest';
import { LOCAL_CATALOG, getCatalog, getComingSoon, getTitleById, isAvailable, searchCatalog } from '../data/catalog.js';
import { buildNotifications, unreadCount } from '../data/notifications.js';
import { favouriteTitle, matchPercent, similarity } from '../data/match.js';
import { planById } from '../data/plans.js';
import { hashPin, isPin } from '../lib/pin.js';

describe('Coming Soon', () => {
  it('keeps future titles out of browsing and search until they arrive', () => {
    const coming = getComingSoon();
    expect(coming.length).toBe(6);
    expect(coming.every((t) => !isAvailable(t))).toBe(true);
    expect(getCatalog().some((t) => t.id === 'anatomy-of-a-fall')).toBe(false);
    expect(searchCatalog('anatomy')).toEqual([]);
    // Sorted by arrival date.
    expect(coming.map((t) => t.availableFrom)).toEqual([...coming.map((t) => t.availableFrom)].sort());
  });

  it('treats a title as available once its date has passed', () => {
    expect(isAvailable({ availableFrom: '2000-01-01' })).toBe(true);
    expect(isAvailable({})).toBe(true);
  });
});

describe('notifications', () => {
  const now = new Date('2026-12-10T12:00:00Z');
  const arrived = { id: 'x', availableFrom: '2026-12-06', addedAt: '2026-01-01T00:00:00Z' };
  const old = { id: 'y', addedAt: '2025-01-01T00:00:00Z' };

  it('announces reminded titles that arrived, and recent arrivals', () => {
    const reminded = buildNotifications({ catalog: [arrived, old], reminderIds: ['x'], now });
    expect(reminded).toEqual([expect.objectContaining({ kind: 'available', id: 'available:x' })]);
    const plain = buildNotifications({ catalog: [arrived, old], reminderIds: [], now });
    expect(plain.map((n) => n.kind)).toEqual(['new']);
  });

  it('counts only items newer than the last visit', () => {
    const items = [{ at: '2026-12-06T00:00:00Z' }, { at: '2026-11-01T00:00:00Z' }];
    expect(unreadCount(items, null)).toBe(2);
    expect(unreadCount(items, '2026-11-15T00:00:00Z')).toBe(1);
  });
});

describe('% Match', () => {
  const godfather = getTitleById('the-godfather');
  const sopranos = getTitleById('the-sopranos');
  const octopus = getTitleById('my-octopus-teacher');

  it('scores titles like the ones you love higher', () => {
    const ratings = new Map([['the-godfather', 'love']]);
    const close = matchPercent(sopranos, ratings, getTitleById);
    const far = matchPercent(octopus, ratings, getTitleById);
    expect(close).toBeGreaterThan(far);
    expect(close).toBeLessThanOrEqual(98);
    expect(far).toBeGreaterThanOrEqual(50);
  });

  it('shows nothing without ratings or for a title already rated', () => {
    expect(matchPercent(sopranos, new Map(), getTitleById)).toBeNull();
    expect(matchPercent(godfather, new Map([['the-godfather', 'like']]), getTitleById)).toBeNull();
  });

  it('picks the loved title for Because you liked', () => {
    const ratings = new Map([
      ['moonlight', 'like'],
      ['the-godfather', 'love'],
    ]);
    expect(favouriteTitle(ratings, getTitleById).id).toBe('the-godfather');
    expect(similarity(godfather, godfather)).toBe(1);
  });
});

describe('plans and profile lock', () => {
  it('knows the three mock plans', () => {
    expect(planById('premium')).toMatchObject({ screens: 4, price: 'Free' });
    expect(planById('nope')).toBeNull();
  });

  it('hashes a 4-digit PIN with the profile id as salt', async () => {
    expect(isPin('1234')).toBe(true);
    expect(isPin('12a4')).toBe(false);
    const a = await hashPin('profile-a', '1234');
    expect(a).toMatch(/^[0-9a-f]{64}$/);
    expect(await hashPin('profile-b', '1234')).not.toBe(a);
  });
});

it('bundles 66 titles: 60 available and 6 Coming Soon', () => {
  expect(LOCAL_CATALOG).toHaveLength(66);
});
