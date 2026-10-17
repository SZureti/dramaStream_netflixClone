import { expect, test } from '@playwright/test';
import { asGuest } from './helpers.js';

test('phone layout: tab bar navigation and no sideways scrolling', async ({ page }) => {
  await asGuest(page);
  await page.goto('/');
  const tabs = page.getByRole('navigation', { name: 'Primary (mobile)' });
  await expect(tabs).toBeVisible();
  await tabs.getByRole('link', { name: 'Search' }).click();
  await expect(page).toHaveURL(/\/search$/);
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
  expect(overflow).toBeLessThanOrEqual(0);
});

test('phone layout: the trailer player fits the screen at 16:9', async ({ page }) => {
  await asGuest(page);
  await page.route('https://www.youtube-nocookie.com/**', (route) =>
    route.fulfill({ contentType: 'text/html', body: '<!doctype html><title>Trailer stub</title>' }),
  );
  await page.goto('/titles/the-pitt');
  await page.getByRole('button', { name: 'Trailer' }).click();
  const box = await page.locator('.trailer-dialog iframe').boundingBox();
  const width = await page.evaluate(() => window.innerWidth);
  expect(box.width).toBeLessThanOrEqual(width);
  expect(box.width / box.height).toBeCloseTo(16 / 9, 1);
  await page.getByRole('button', { name: 'Close trailer' }).click();
  await expect(page.locator('.trailer-dialog')).toHaveCount(0);
});
