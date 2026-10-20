import { expect, test } from '@playwright/test';
import { asGuest } from './helpers.js';

// The Edge Functions are mocked, so these tests never touch TMDB or the network.
const CORS = {
  'access-control-allow-origin': '*',
  'access-control-allow-headers': 'authorization, x-client-info, apikey, content-type',
  'content-type': 'application/json',
};

const HITS = [
  // Already in the DramaStream catalog, so the page should hide it.
  { id: 496243, type: 'movie', title: 'Parasite', year: 2019, overview: '', poster: null, rating: 8.5 },
  { id: 42507, type: 'tv', title: 'Parasite Dolls', year: 2003, overview: 'Androids.', poster: null, rating: 6.6 },
  { id: 810509, type: 'movie', title: 'Parasite Choon', year: 2021, overview: '', poster: null, rating: null },
];

const DETAILS = {
  id: 42507,
  type: 'tv',
  title: 'Parasite Dolls',
  tagline: 'Maintain the peace.',
  year: 2003,
  overview: 'MegaTokyo 2034: androids called Boomers have infiltrated society.',
  genres: ['Animation', 'Sci-Fi & Fantasy'],
  runtime: 30,
  seasons: 1,
  episodes: 3,
  status: 'Ended',
  rating: 6.6,
  poster: null,
  backdrop: null,
  directors: ['Some Creator'],
  cast: [
    { name: 'Kazuhiko Inoue', character: 'Buzz Nikvest', photo: null },
    { name: 'Akemi Okamura', character: 'Reiko Michaelson', photo: null },
  ],
};

/** Answer a function call with JSON (or an error status) and remember what was sent. */
async function mockFunction(page, name, { status = 200, body }) {
  const calls = [];
  await page.route(`**/functions/v1/${name}`, async (route) => {
    const request = route.request();
    if (request.method() === 'OPTIONS') return route.fulfill({ status: 200, headers: CORS });
    calls.push(request.postDataJSON());
    return route.fulfill({ status, headers: CORS, body: JSON.stringify(body) });
  });
  return calls;
}

test.describe('TMDB titles in search', () => {
  test.beforeEach(async ({ page }) => asGuest(page));

  test('search adds a "More from TMDB" section, without titles we already have', async ({ page }) => {
    const calls = await mockFunction(page, 'tmdb-search', { body: { results: HITS } });
    await page.goto('/search');
    await page.getByRole('searchbox').fill('parasite');

    const section = page.getByRole('region', { name: 'More from TMDB' });
    await expect(section.locator('.card__title')).toHaveText(['Parasite Dolls', 'Parasite Choon']);
    await expect(section).toContainText('Series · 2003');
    await expect(section).toContainText('out of 10 on TMDB');
    // Our own catalog match still shows above, and the duplicate isn't repeated below.
    await expect(page.getByRole('heading', { name: /1 result for/ })).toBeVisible();
    expect(calls).toEqual([{ q: 'parasite' }]);
  });

  test('typing waits for a pause, and one letter does not search', async ({ page }) => {
    const calls = await mockFunction(page, 'tmdb-search', { body: { results: HITS } });
    await page.goto('/search');
    await page.getByRole('searchbox').pressSequentially('p');
    await page.waitForTimeout(700);
    expect(calls).toHaveLength(0);
    await page.getByRole('searchbox').pressSequentially('arasite', { delay: 30 });
    await expect(page.getByRole('region', { name: 'More from TMDB' })).toBeVisible();
    expect(calls).toEqual([{ q: 'parasite' }]);
  });

  test('if TMDB fails, the catalog results still show and the section stays hidden', async ({ page }) => {
    await mockFunction(page, 'tmdb-search', { status: 502, body: { error: 'TMDB responded with status 500.' } });
    await page.goto('/search');
    await page.getByRole('searchbox').fill('parasite');
    await expect(page.getByRole('heading', { name: /1 result for/ })).toBeVisible();
    await page.waitForTimeout(1200);
    await expect(page.getByRole('heading', { name: 'More from TMDB' })).toHaveCount(0);
  });

  test('a TMDB card opens a details page with overview and cast, and Back returns to the search', async ({ page }) => {
    await mockFunction(page, 'tmdb-search', { body: { results: HITS } });
    const detailCalls = await mockFunction(page, 'tmdb-details', { body: { details: DETAILS } });
    await page.goto('/search?q=parasite');
    await page.getByRole('link', { name: 'Parasite Dolls' }).click();

    await expect(page).toHaveURL(/\/tmdb\/tv\/42507$/);
    await expect(page.getByRole('heading', { level: 1, name: 'Parasite Dolls' })).toBeVisible();
    await expect(page.getByText('androids called Boomers')).toBeVisible();
    await expect(page.getByText('Animation, Sci-Fi & Fantasy')).toBeVisible();
    await expect(page.getByText('1 season · 3 episodes')).toBeVisible();
    await expect(page.getByText('Created by')).toBeVisible();
    await expect(page.getByRole('region', { name: 'Cast' }).locator('.tmdb-cast__name')).toHaveText([
      'Kazuhiko Inoue',
      'Akemi Okamura',
    ]);
    await expect(page.getByText(/uses the TMDB API/)).toBeVisible();
    // React StrictMode runs effects twice in dev, so allow repeats of the same request.
    expect(detailCalls.length).toBeGreaterThan(0);
    for (const call of detailCalls) expect(call).toEqual({ type: 'tv', id: '42507' });

    await page.getByRole('button', { name: 'Back to Search' }).click();
    await expect(page).toHaveURL(/\/search\?q=parasite$/);
    await expect(page.getByRole('region', { name: 'More from TMDB' })).toBeVisible();
  });

  test('a TMDB title that cannot load shows a friendly message', async ({ page }) => {
    await mockFunction(page, 'tmdb-details', { status: 404, body: { error: 'No movie with id 1 on TMDB.' } });
    await page.goto('/tmdb/movie/1');
    await expect(page.getByRole('heading', { name: "Couldn't load this title" })).toBeVisible();
    await page.getByRole('link', { name: 'Back to Search' }).click();
    await expect(page).toHaveURL(/\/search$/);
  });

  test('an unknown TMDB type is rejected without calling the function', async ({ page }) => {
    const calls = await mockFunction(page, 'tmdb-details', { body: { details: DETAILS } });
    await page.goto('/tmdb/person/1');
    await expect(page.getByRole('heading', { name: "Couldn't load this title" })).toBeVisible();
    expect(calls).toHaveLength(0);
  });
});
