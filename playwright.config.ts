import { defineConfig, devices } from '@playwright/test';

const E2E_HOST = process.env.PLAYWRIGHT_HOST ?? '127.0.0.1';
const E2E_PORT = Number(process.env.PLAYWRIGHT_PORT ?? '4173');
const E2E_BASE_URL = `http://${E2E_HOST}:${E2E_PORT}`;
const includeWebkit = process.env.PLAYWRIGHT_INCLUDE_WEBKIT === '1';
const parsedWorkerCount = Number(process.env.PLAYWRIGHT_WORKERS ?? '2');
const localWorkers = Number.isFinite(parsedWorkerCount) && parsedWorkerCount > 0 ? parsedWorkerCount : 2;

export default defineConfig({
  timeout: 120000,
  testDir: './e2e',
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : localWorkers,
  reporter: 'html',
  expect: {
    timeout: 15000,
  },
  use: {
    baseURL: E2E_BASE_URL,
    navigationTimeout: 90000,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    ...(includeWebkit
      ? [
          {
            name: 'Mobile Safari',
            use: { ...devices['iPhone 13'] },
          },
        ]
      : []),
  ],
  webServer: {
    command: `env -u FORCE_COLOR -u NO_COLOR npm run dev -- --webpack --hostname ${E2E_HOST} --port ${E2E_PORT}`,
    url: E2E_BASE_URL,
    reuseExistingServer: false,
    timeout: 180000,
  },
});
