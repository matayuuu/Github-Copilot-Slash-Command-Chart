import { defineConfig } from '@playwright/test';

const isCI = Boolean(process.env.CI);
const baseURL = 'http://127.0.0.1:4173/Github-Copilot-Slash-Command-Chart/';

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: true,
  workers: 2,
  retries: isCI ? 1 : 0,
  reporter: isCI ? [['line'], ['html', { open: 'never' }]] : [['list']],
  use: {
    baseURL,
    screenshot: 'only-on-failure',
    trace: 'retain-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: { browserName: 'chromium', viewport: { width: 1440, height: 1000 } },
    },
    {
      name: 'firefox',
      use: { browserName: 'firefox', viewport: { width: 1440, height: 1000 } },
    },
    {
      name: 'mobile-chromium',
      use: {
        browserName: 'chromium',
        viewport: { width: 390, height: 844 },
        isMobile: true,
        hasTouch: true,
      },
    },
  ],
  webServer: {
    command: 'npm run preview -- --port 4173 --strictPort',
    url: baseURL,
    reuseExistingServer: false,
    timeout: 30_000,
  },
});
