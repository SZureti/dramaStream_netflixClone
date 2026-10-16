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
