// Start every test as a returning guest (skips the welcome page) unless a test says otherwise.
export async function asGuest(page, extra = {}) {
  await page.addInitScript((data) => {
    if (sessionStorage.getItem('e2e-seeded')) return;
    sessionStorage.setItem('e2e-seeded', '1');
    localStorage.clear();
    localStorage.setItem('dramastream:guest:v1', '1');
    for (const [key, value] of Object.entries(data)) localStorage.setItem(key, JSON.stringify(value));
  }, extra);
}

const CORS = {
  'access-control-allow-origin': '*',
  'access-control-allow-headers': 'authorization, x-client-info, apikey, content-type',
  'content-type': 'application/json',
};

/** Answer a function call with JSON (or an error status) and remember what was sent. */
export async function mockFunction(page, name, { status = 200, body }) {
  const calls = [];
  await page.route(`**/functions/v1/${name}`, async (route) => {
    const request = route.request();
    if (request.method() === 'OPTIONS') return route.fulfill({ status: 200, headers: CORS });
    calls.push(request.postDataJSON());
    return route.fulfill({ status, headers: CORS, body: JSON.stringify(body) });
  });
  return calls;
}

/** Put the running app on a restricted (Kids) maturity level, as a Kids profile would. */
export async function asKidsProfile(page, level = 'little-kids') {
  await page.evaluate(async (lvl) => (await import('/src/data/catalog.js')).setMaturityLimit(lvl), level);
}

/** Move around inside the app without a reload, so the maturity level set above is kept. */
export async function goInApp(page, path) {
  await page.evaluate((p) => {
    window.history.pushState({}, '', p);
    window.dispatchEvent(new PopStateEvent('popstate'));
  }, path);
}
