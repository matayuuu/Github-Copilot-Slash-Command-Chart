import { defineConfig } from '@playwright/test';
import { readDeploymentSettings } from './tests/deployment/settings';

const settings = readDeploymentSettings(process.env.DEPLOYMENT_URL, process.env.EXPECTED_REVISION);

export default defineConfig({
  testDir: './tests/deployment',
  testMatch: '**/*.spec.ts',
  outputDir: './test-results/deployment',
  forbidOnly: true,
  workers: 1,
  retries: 0,
  reporter: 'line',
  use: {
    baseURL: settings.baseURL,
    browserName: 'chromium',
    viewport: { width: 1280, height: 900 },
    screenshot: 'only-on-failure',
    trace: 'retain-on-failure',
  },
});
