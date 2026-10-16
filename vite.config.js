import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  // Vitest runs the unit tests only; e2e/ belongs to Playwright.
  test: { exclude: ['e2e/**', 'node_modules/**'] },
});
