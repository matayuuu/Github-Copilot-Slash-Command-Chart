import { expect, test } from '@playwright/test';
import { categories, environmentIds } from '../../src/catalog/types';
import { commands, environments, sources } from '../../src/data';
import {
  environmentButton,
  expectParameter,
  expectResults,
  openApp,
  row,
  rows,
  search,
} from './helpers';

test('renders the complete local catalog without runtime errors or external API requests', async ({
  page,
  baseURL,
}) => {
  if (!baseURL) throw new Error('A production preview baseURL is required.');
  const origin = new URL(baseURL).origin;
  const errors: string[] = [];
  const externalApiRequests: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  page.on('request', (request) => {
    if (
      ['fetch', 'xhr', 'websocket', 'eventsource'].includes(request.resourceType()) &&
      new URL(request.url()).origin !== origin
    ) {
      externalApiRequests.push(request.url());
    }
  });

  await openApp(page);
  await expect(page).toHaveTitle(/Copilot Command Atlas/u);
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  await expect(page.locator('#result-count')).toHaveAttribute('aria-live', 'polite');
  await expectResults(page);
  await expect(page.locator('#category-filter option')).toHaveCount(categories.length + 1);
  for (const id of ['all', ...environmentIds]) {
    await expect(environmentButton(page, id)).toBeVisible();
  }
  await row(page, 'vscode-explain').click();
  await expect(page.locator('#detail-title')).toHaveText('/explain');
  await page.getByRole('button', { name: '詳細を閉じる', exact: true }).click();
  await search(page).fill('説明');
  await expectResults(page, { query: '説明' });
  await page.locator('#sources-open').click();
  await expect(page.locator('#sources-dialog')).toBeVisible();
  expect(errors).toEqual([]);
  expect(externalApiRequests).toEqual([]);
});

test('every environment button filters actual records and exposes its pressed state', async ({
  page,
}) => {
  await openApp(page);
  for (const environment of [...environmentIds, 'all'] as const) {
    await test.step(environment, async () => {
      await environmentButton(page, environment).click();
      await expect(environmentButton(page, environment)).toHaveAttribute('aria-pressed', 'true');
      await expectResults(page, { environment });
      await expectParameter(page, 'env', environment === 'all' ? null : environment);
    });
  }
});

test('search supports Japanese, case, NFKC, aliases, subcommands and all-term matching', async ({
  page,
}) => {
  const alias = commands.flatMap((command) => command.aliases)[0];
  const subcommand = commands.flatMap((command) => command.subcommands)[0];
  if (!alias || !subcommand) throw new Error('Search coverage requires an alias and subcommand.');

  await openApp(page);
  for (const query of [
    '説明',
    'EXPLAIN',
    '／ＥＸＰＬＡＩＮ',
    alias,
    subcommand.syntax,
    '/explain 説明',
  ]) {
    await test.step(query, async () => {
      await search(page).fill(query);
      await expectResults(page, { query });
      await expect(rows(page).first()).toBeVisible();
      await expectParameter(page, 'q', query);
    });
  }
  await search(page).fill('');
  await expectResults(page);
  await expectParameter(page, 'q', null);
});

test('combines text, environment and category while preserving same-name records', async ({
  page,
}) => {
  await openApp(page);
  await search(page).fill('/explain');
  await expectResults(page, { query: '/explain' });
  const explainEnvironments = new Set(
    commands
      .filter((command) => command.command === '/explain')
      .map((command) => command.environmentId),
  );
  expect(explainEnvironments.size).toBeGreaterThan(1);
  await environmentButton(page, 'vscode').click();
  await page.getByRole('combobox', { name: '用途', exact: true }).selectOption('documentation');
  await expectResults(page, {
    query: '/explain',
    environment: 'vscode',
    category: 'documentation',
  });
  await expect(row(page, 'vscode-explain')).toBeVisible();
  await expectParameter(page, 'env', 'vscode');
  await expectParameter(page, 'category', 'documentation');
});

test('empty search explains recovery and both clear controls reset the whole state', async ({
  page,
}) => {
  await openApp(page, '?env=cli&category=session&q=no-such-atlas-command-98af');
  await expectResults(page, {
    environment: 'cli',
    category: 'session',
    query: 'no-such-atlas-command-98af',
  });
  const empty = page.locator('#empty-state');
  await expect(empty).toBeVisible();
  await expect(empty.getByRole('heading')).toHaveText(/一致するコマンドがありません/u);
  await expect(empty.locator('p')).not.toHaveText('');
  await empty.getByRole('button').click();
  await expectResults(page);
  await expect(search(page)).toHaveValue('');
  await expect(page.locator('#category-filter')).toHaveValue('all');
  await expect(environmentButton(page, 'all')).toHaveAttribute('aria-pressed', 'true');
  for (const key of ['q', 'env', 'category', 'command']) await expectParameter(page, key, null);
  await expect(search(page)).toBeFocused();
  await expect(empty).toBeHidden();

  await environmentButton(page, 'cli').click();
  await search(page).fill('clear');
  await page.locator('#reset-filters').click();
  await expectResults(page);
  await expect(page.locator('#reset-filters')).toBeHidden();
});

test('unverified coverage is explained without treating it as confirmed unsupported', async ({
  page,
}) => {
  const environment = environments.find((item) => item.coverage === 'unverified');
  if (!environment) throw new Error('The approved catalog includes unverified environments.');
  await openApp(page, `?env=${environment.id}`);
  await expectResults(page, { environment: environment.id });
  await expect(page.locator('#empty-state')).toContainText('確認中');
  await expect(page.locator('#empty-state')).toContainText(environment.note);
  await expect(page.locator('#empty-state').getByRole('button')).toBeVisible();
});

test('HTML-looking URL and input queries remain literal text and never execute', async ({
  page,
}) => {
  const payload = '<img src=x onerror="document.documentElement.dataset.executed=1">';
  await openApp(page, `?${new URLSearchParams({ q: payload })}`);
  await expect(search(page)).toHaveValue(payload);
  await expect(page.locator('#empty-state')).toBeVisible();
  await expect(page.locator('img[src="x"]')).toHaveCount(0);
  await expect(page.locator('html')).not.toHaveAttribute('data-executed', '1');
  await expectParameter(page, 'q', payload);

  const secondPayload = '<svg onload="document.documentElement.dataset.executed=1"></svg>';
  await search(page).fill(secondPayload);
  await expect(page.locator('#empty-state')).toBeVisible();
  await expect(search(page)).toHaveValue(secondPayload);
  await expect(page.locator('svg[onload]')).toHaveCount(0);
  await expect(page.locator('html')).not.toHaveAttribute('data-executed', '1');
  await expectParameter(page, 'q', secondPayload);
});

test('source dialog exposes all environment coverage and official references with keyboard recovery', async ({
  page,
}) => {
  await openApp(page);
  await page.getByRole('button', { name: /収録範囲・出典/u }).click();
  const dialog = page.getByRole('dialog', { name: '収録範囲と公式資料', exact: true });
  await expect(dialog).toBeVisible();
  for (const environment of environments) {
    await expect(
      dialog.getByRole('heading', { name: environment.name, exact: true }),
    ).toBeVisible();
  }
  for (const source of sources) {
    const link = dialog.locator('a').filter({ hasText: source.title });
    await expect(link.first()).toHaveAttribute('href', source.url);
    await expect(link.first()).toHaveAttribute('target', '_blank');
    await expect(link.first()).toHaveAttribute('rel', /noopener/u);
  }
  await page.keyboard.press('Escape');
  await expect(dialog).toBeHidden();
  await expect(page.locator('#sources-open')).toBeFocused();
  await page.locator('#sources-open').click();
  await page.locator('#sources-close').click();
  await expect(dialog).toBeHidden();
});
