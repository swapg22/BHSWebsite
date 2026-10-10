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
  reporter: [['list'], ['html', { open: 'never' }]],
  timeout: 45_000,
  expect: { timeout: 10_000 },
  use: { baseURL: 'http://localhost:3000', trace: 'retain-on-failure', screenshot: 'only-on-failure' },
  projects: [
    { name: 'desktop', use: { ...devices['Desktop Chrome'], ...channel, viewport: { width: 1366, height: 900 } } },
    { name: 'mobile', use: { ...devices['Pixel 7'], ...channel }, grep: /@mobile/ },
  ],
  webServer: { command: 'npm run dev', url: 'http://localhost:3000/healthz', reuseExistingServer: true, timeout: 180_000 },
})
