import { expect, test } from '@playwright/test';
import { asGuest } from './helpers.js';

test.describe('signed-out visitor', () => {
  test('first visit lands on the welcome page and can browse without signing in', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveURL(/\/welcome$/);
    await expect(page.getByRole('heading', { level: 1 })).toContainText('Unlimited drama');
    await page.getByRole('link', { name: 'Browse without signing in' }).first().click();
    await expect(page).toHaveURL(/\/$/);
    await expect(page.getByRole('heading', { name: 'Top 10 on DramaStream Today' })).toBeVisible();
  });

  test('the email form validates, then carries the email to Sign Up', async ({ page }) => {
    await page.goto('/welcome');
    const hero = page.locator('.landing-hero');
    await hero.getByRole('button', { name: 'Get Started' }).click();
    await expect(hero.getByRole('alert')).toHaveText('Enter your email address.');
    await hero.getByLabel('Email address').fill('viewer@example.com');
    await hero.getByRole('button', { name: 'Get Started' }).click();
    await expect(page.getByRole('heading', { name: /Choose your plan/ })).toBeVisible();
    await page.getByRole('button', { name: 'Next' }).click();
    await expect(page.getByLabel('Email')).toHaveValue('viewer@example.com');
  });

  test('Account needs sign-in', async ({ page }) => {
    await asGuest(page);
    await page.goto('/account');
    await expect(page).toHaveURL(/\/signin\?next=%2Faccount/);
  });
});

test.describe('browsing', () => {
  test.beforeEach(async ({ page }) => asGuest(page));

  test('Home shows the rows of 20 titles', async ({ page }) => {
    await page.goto('/');
    const films = page.locator('#drama-films .card');
    await expect(films).toHaveCount(20);
    await expect(page.locator('#top-10 .row__rank').first()).toHaveText('1');
  });

  test('opening a title shows details in a modal; Escape closes it and keeps the page', async ({ page }) => {
    await page.goto('/');
    await page.locator('#drama-series .card__link').first().click();
    const modal = page.locator('dialog.title-modal');
    await expect(modal).toBeVisible();
    await expect(page).toHaveURL(/\/titles\//);
    await expect(modal.getByRole('heading', { name: 'Episodes' })).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(modal).toBeHidden();
    await expect(page).toHaveURL(/\/$/);
  });

  test('a direct link to a title shows the full details page', async ({ page }) => {
    await page.goto('/titles/the-crown');
    await expect(page.locator('dialog.title-modal')).toHaveCount(0);
    await expect(page.getByRole('heading', { name: 'About The Crown' })).toBeVisible();
    await page.getByLabel('Season').selectOption('4');
    await expect(page.locator('.episode')).toHaveCount(10);
    await expect(page.locator('.episode__synopsis').first()).not.toBeEmpty();
  });

  test('search finds titles by actor, and says when nothing matches', async ({ page }) => {
    await page.goto('/search');
    await page.getByRole('searchbox').fill('cranston');
    await expect(page.locator('.results .card__title')).toHaveText(['Breaking Bad']);
    await page.getByRole('searchbox').fill('zzzz');
    await expect(page.getByRole('heading', { name: 'No titles found' })).toBeVisible();
  });

  test('Browse filters by genre', async ({ page }) => {
    await page.goto('/browse/films');
    await page.getByLabel('Genre').selectOption('Crime');
    await expect(page).toHaveURL(/genre=Crime/);
    await expect(page.getByRole('status').filter({ hasText: 'in Crime' })).toBeVisible();
  });
});

test.describe('My List, ratings and Continue Watching', () => {
  test.beforeEach(async ({ page }) => asGuest(page));

  test('adding to My List shows on the My List page and Home, and sorts A–Z', async ({ page }) => {
    await page.goto('/titles/whiplash');
    await page.getByRole('button', { name: 'Add to My List' }).first().click();
    await page.goto('/titles/amy');
    await page.getByRole('button', { name: 'Add to My List' }).first().click();
    await page.goto('/my-list');
    await expect(page.locator('.card__title')).toHaveText(['Amy', 'Whiplash']);
    await page.getByLabel('Sort by').selectOption('za');
    await expect(page.locator('.card__title')).toHaveText(['Whiplash', 'Amy']);
    await page.goto('/');
    await expect(page.locator('#my-list .card')).toHaveCount(2);
  });

  test('rating Love this! adds % Match and a Because you liked row', async ({ page }) => {
    await page.goto('/titles/the-godfather');
    await page.locator('.details-hero__actions').getByRole('button', { name: 'Love this!' }).click();
    await expect(page.getByText('You love this').first()).toBeVisible();
    await page.goto('/');
    await expect(page.getByRole('heading', { name: 'Because you liked The Godfather' })).toBeVisible();
    await page.locator('#drama-series .card__link').first().click();
    await expect(page.locator('dialog.title-modal .title-modal__match')).toContainText('% Match');
  });

  test('the player saves progress for Resume and Continue Watching', async ({ page }) => {
    await page.goto('/watch/chernobyl?s=1&e=1');
    for (let i = 0; i < 12; i += 1) await page.getByRole('button', { name: 'Forward 10 seconds' }).click();
    await page.getByRole('button', { name: 'Back to Details' }).click();
    await expect(page.getByRole('link', { name: /Resume/ })).toBeVisible();
    await page.goto('/');
    await expect(page.locator('#continue-watching .card__title')).toHaveText(['Chernobyl']);
  });

  test('the player plays the next episode after a countdown', async ({ page }) => {
    await page.goto('/watch/chernobyl?s=1&e=1');
    const seek = page.getByLabel('Seek');
    const max = await seek.getAttribute('max');
    await seek.fill(String(Number(max) - 1));
    await page.getByRole('button', { name: 'Play', exact: true }).click();
    await expect(page.getByText(/Next episode in/)).toBeVisible();
    await page.getByRole('button', { name: 'Play Now' }).click();
    await expect(page).toHaveURL(/s=1&e=2/);
    await expect(page.locator('.player__episode')).toContainText('S1:E2');
  });
});

test.describe('New & Popular', () => {
  test.beforeEach(async ({ page }) => asGuest(page));

  test('Coming Soon titles take reminders and are not playable yet', async ({ page }) => {
    await page.goto('/new');
    const first = page.locator('.coming-soon__item').first();
    await expect(first.locator('.coming-soon__date')).not.toBeEmpty();
    const remind = first.getByRole('button', { name: /Remind Me/ });
    await remind.click();
    await expect(remind).toHaveAttribute('aria-pressed', 'true');
    await page.goto('/watch/anatomy-of-a-fall');
    await expect(page.getByRole('heading', { name: 'Coming soon' })).toBeVisible();
  });

  test('the bell lists new arrivals', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: /Notifications/ }).click();
    await expect(page.locator('.bell__panel')).toBeVisible();
    await expect(page.locator('.bell__item').first()).toBeVisible();
  });
});
