import { defineConfig, devices } from '@playwright/test';

// Only run chromium in CI to match the installed browser
const projects = process.env.CI
  ? [
      {
        name: 'chromium',
        use: { ...devices['Desktop Chrome'] },
      },
    ]
  : [
      {
        name: 'chromium',
        use: { ...devices['Desktop Chrome'] },
      },
      {
        name: 'Mobile Safari',
        use: { ...devices['iPhone 13'] },
      },
    ];

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  projects,
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 120000,
  },
});
