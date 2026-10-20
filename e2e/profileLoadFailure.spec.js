import { readFileSync } from 'node:fs';
import { expect, test } from '@playwright/test';
import { mockFunction } from './helpers.js';

// A signed-in account whose profiles can't be fetched has no known maturity level, so the
// app must not show titles (or call TMDB) as if the profile were unrestricted.
// The session is a made-up one planted in storage; only the profiles request is mocked.
function supabaseHost() {
  try {
    const env = readFileSync(new URL('../.env.local', import.meta.url), 'utf8');
    return new URL(/^VITE_SUPABASE_URL=(.+)$/m.exec(env)[1].trim()).hostname;
  } catch {
    return null;
  }
}

const b64 = (o) => Buffer.from(JSON.stringify(o)).toString('base64url');
function fakeSession() {
  const exp = Math.floor(Date.now() / 1000) + 3600;
  const user = {
    id: '00000000-0000-4000-8000-000000000001',
    aud: 'authenticated',
    role: 'authenticated',
    email: 'e2e@example.com',
    app_metadata: {},
    user_metadata: {},
    created_at: '2026-01-01T00:00:00Z',
  };
  const token = `${b64({ alg: 'HS256', typ: 'JWT' })}.${b64({ sub: user.id, role: 'authenticated', exp })}.sig`;
  return { access_token: token, refresh_token: 'fake-refresh', token_type: 'bearer', expires_in: 3600, expires_at: exp, user };
}

const PROFILE = {
  id: '00000000-0000-4000-8000-0000000000aa',
  user_id: '00000000-0000-4000-8000-000000000001',
  name: 'Me',
  avatar: 'red',
  is_kids: false,
  max_maturity: 'all',
  language: 'en',
  created_at: '2026-01-01T00:00:00Z',
};

test.describe('when profiles fail to load', () => {
  const host = supabaseHost();
  test.skip(!host, 'needs VITE_SUPABASE_URL in .env.local');

  test('shows a retry screen instead of any titles, then recovers on retry', async ({ page }) => {
    const session = fakeSession();
    await page.addInitScript(
      ([key, value]) => {
        localStorage.clear();
        localStorage.setItem('dramastream:guest:v1', '1');
        localStorage.setItem(key, JSON.stringify(value));
      },
      [`sb-${host.split('.')[0]}-auth-token`, session],
    );

    let profileCalls = 0;
    await page.route('**/rest/v1/profiles*', (route) => {
      profileCalls += 1;
      const headers = { 'access-control-allow-origin': '*', 'content-type': 'application/json' };
      if (route.request().method() === 'OPTIONS') return route.fulfill({ status: 200, headers });
      return profileCalls === 1
        ? route.fulfill({ status: 500, headers, body: JSON.stringify({ message: 'boom' }) })
        : route.fulfill({ status: 200, headers, body: JSON.stringify([PROFILE]) });
    });
    const details = await mockFunction(page, 'tmdb-details', { body: { details: {} } });

    // An adult title's address: nothing about it may show while the profile is unknown.
    await page.goto('/titles/breaking-bad');
    await expect(page.getByRole('heading', { name: 'Couldn’t load your profiles' })).toBeVisible();
    await expect(page.getByText('Albuquerque')).toHaveCount(0);
    await expect(page.getByRole('heading', { name: 'Top 10 on DramaStream Today' })).toHaveCount(0);
    expect(details).toHaveLength(0);

    // Retrying works once the profiles can be fetched.
    await page.getByRole('button', { name: 'Try again' }).click();
    await expect(page.getByRole('heading', { name: 'Couldn’t load your profiles' })).toHaveCount(0);
  });
});
