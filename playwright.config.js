// End-to-end tests for the main journeys: `npm run test:e2e`.
// Starts the Vite dev server (or reuses one already running on port 5173).
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  timeout: 60_000,
  globalTimeout: 10 * 60_000,
  // The Vite dev server compiles on demand; a couple of workers keeps page loads quick.
  workers: 2,
  expect: { timeout: 8_000 },
  fullyParallel: true,
  reporter: [['list']],
  use: {
    baseURL: 'http://localhost:5173',
    trace: 'retain-on-failure',
  },
  projects: [
    {
      name: 'desktop',
      use: { ...devices['Desktop Chrome'], viewport: { width: 1440, height: 900 } },
      testIgnore: /mobile\.spec\.js/,
    },
    { name: 'phone', use: { ...devices['Pixel 7'] }, testMatch: /mobile\.spec\.js/ },
  ],
  webServer: {
    command: 'npm run dev -- --port 5173 --strictPort',
    url: 'http://localhost:5173',
    reuseExistingServer: true,
    timeout: 60_000,
  globalTimeout: 10 * 60_000,
  },
});
