import { expect, test } from '@playwright/test';
import { asGuest, asKidsProfile, goInApp, mockFunction } from './helpers.js';

// A guest has no profiles, so these tests switch the running app to a Kids maturity
// level, the same call a Kids profile makes when it is chosen.
test.describe('Kids profile restrictions', () => {
  test.beforeEach(async ({ page }) => {
    await asGuest(page);
    await page.goto('/');
    await expect(page.getByRole('heading', { name: 'Top 10 on DramaStream Today' })).toBeVisible();
    await asKidsProfile(page, 'little-kids');
  });

  test('opening an adult title by its address is blocked, with no synopsis or Play button', async ({ page }) => {
    await goInApp(page, '/titles/breaking-bad');
    await expect(page.getByRole('heading', { name: 'Not available on this profile' })).toBeVisible();
    await expect(page.getByText('Breaking Bad is rated TV-MA')).toBeVisible();
    await expect(page.getByRole('link', { name: /^Play/ })).toHaveCount(0);
    await expect(page.getByText('Albuquerque')).toHaveCount(0);
    await page.getByRole('link', { name: 'Back to Home' }).click();
    await expect(page).toHaveURL(/\/$/);
  });

  test('the player is still blocked for an adult title', async ({ page }) => {
    await goInApp(page, '/watch/breaking-bad');
    await expect(page.getByRole('heading', { name: 'Not available on this profile' })).toBeVisible();
  });

  test('TMDB search, title and actor pages are unavailable and never call TMDB', async ({ page }) => {
    const search = await mockFunction(page, 'tmdb-search', { body: { results: [] } });
    const details = await mockFunction(page, 'tmdb-details', { body: { details: {} } });
    const person = await mockFunction(page, 'tmdb-person', { body: { person: {} } });

    await goInApp(page, '/search?q=parasite');
    await page.waitForTimeout(1000);
    await expect(page.getByRole('heading', { name: 'More from TMDB' })).toHaveCount(0);

    await goInApp(page, '/tmdb/tv/42507');
    await expect(page.getByRole('heading', { name: 'Not available on this profile' })).toBeVisible();
    await goInApp(page, '/person/17419');
    await expect(page.getByRole('heading', { name: 'Not available on this profile' })).toBeVisible();

    expect(search.length + details.length + person.length).toBe(0);
  });

  test('a title the profile may see still opens normally, without Full cast', async ({ page }) => {
    await asKidsProfile(page, 'older-kids');
    const details = await mockFunction(page, 'tmdb-details', { body: { details: {} } });
    await goInApp(page, '/titles/my-octopus-teacher');
    await expect(page.getByRole('heading', { level: 1, name: 'My Octopus Teacher' })).toBeVisible();
    await page.waitForTimeout(1000);
    await expect(page.getByRole('heading', { name: 'Full cast' })).toHaveCount(0);
    expect(details).toHaveLength(0);
  });
});
