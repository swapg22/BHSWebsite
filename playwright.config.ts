import { defineConfig, devices } from '@playwright/test'
import 'dotenv/config'

// Locally, use the installed Google Chrome; CI installs Playwright's Chromium
const channel = process.env.CI ? {} : { channel: 'chrome' as const }

/** End-to-end journeys against the dev server with seeded data (npm run reset first). */
export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: false,
  workers: 1,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  // On CI the github reporter turns each failure into a readable annotation on the run
  reporter: process.env.CI ? [['github'], ['list'], ['html', { open: 'never' }]] : [['list'], ['html', { open: 'never' }]],
  globalSetup: './tests/e2e/warmup.ts',
  timeout: process.env.CI ? 120_000 : 45_000,
  expect: { timeout: process.env.CI ? 20_000 : 10_000 },
  use: { baseURL: 'http://localhost:3000', trace: 'retain-on-failure', screenshot: 'only-on-failure' },
  projects: [
    { name: 'desktop', use: { ...devices['Desktop Chrome'], ...channel, viewport: { width: 1366, height: 900 } } },
    { name: 'mobile', use: { ...devices['Pixel 7'], ...channel }, grep: /@mobile/ },
  ],
  webServer: { command: 'npm run dev', url: 'http://localhost:3000/healthz', reuseExistingServer: true, timeout: 180_000 },
})
