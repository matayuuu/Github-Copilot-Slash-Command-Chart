import { expect, test } from '@playwright/test';
import { commands } from '../../src/data';
import { environmentButton, row, rows, search } from '../e2e/helpers';
import { readDeploymentSettings } from './settings';

const settings = readDeploymentSettings(process.env.DEPLOYMENT_URL, process.env.EXPECTED_REVISION);

test('serves the expected deployed commit anonymously', async ({ request, page }) => {
  test.setTimeout(150_000);
  const metadataUrl = new URL('build-info.json', settings.baseURL);
  metadataUrl.searchParams.set('revision', settings.revision);
  await expect(async () => {
    const response = await request.get(metadataUrl.href);
    expect(response.status()).toBe(200);
    const metadata: unknown = await response.json();
    expect(metadata).toEqual({ revision: settings.revision });
    const pageResponse = await page.goto('./');
    expect(pageResponse?.status()).toBe(200);
    await expect(page.locator('meta[name="build-revision"]')).toHaveAttribute(
      'content',
      settings.revision,
    );
  }).toPass({ timeout: 120_000, intervals: [1_000, 2_000, 5_000, 10_000] });

  await expect(rows(page)).toHaveCount(commands.length);
  console.info(`Verified public deployment: ${settings.revision} at ${settings.baseURL}`);
});

test('supports search, filtering and shared command URLs on the published site', async ({
  page,
}) => {
  await page.goto('./');
  await search(page).fill('explain');
  await environmentButton(page, 'vscode').click();
  await row(page, 'vscode-explain').click();
  await expect(page.locator('#detail-title')).toHaveText('/explain');
  await expect(page.getByRole('button', { name: 'コマンドをコピー', exact: true })).toBeVisible();

  const sharedUrl = page.url();
  await page.reload();
  await expect(page).toHaveURL(sharedUrl);
  await expect(page.locator('#detail-title')).toHaveText('/explain');
  await expect(row(page, 'vscode-explain')).toHaveAttribute('aria-pressed', 'true');

  await search(page).fill('no-such-deployment-command-7bc1');
  await expect(page.locator('#empty-state')).toBeVisible();
  await page.locator('#reset-filters').click();
  await expect(rows(page)).toHaveCount(commands.length);
});

test('loads assets without runtime errors and keeps the mobile layout within the viewport', async ({
  page,
}) => {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  page.on('requestfailed', (request) => errors.push(`Request failed: ${request.url()}`));
  page.on('response', (response) => {
    if (response.status() >= 400) errors.push(`HTTP ${response.status()}: ${response.url()}`);
  });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('./?env=cli&q=help&command=cli-help');
  await expect(page.locator('#detail-title')).toHaveText('/help');
  await expect(page.locator('meta[name="build-revision"]')).toHaveAttribute(
    'content',
    settings.revision,
  );
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(
    true,
  );
  expect(errors).toEqual([]);
});
