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
