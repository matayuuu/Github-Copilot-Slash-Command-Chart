import { expect, test } from '@playwright/test';
import { environmentButton, expectParameter, expectResults, openApp, row, search } from './helpers';

test('direct URL restores query, filters and selection under the Pages base path', async ({
  page,
}) => {
  const params = new URLSearchParams({
    q: '/explain 説明',
    env: 'vscode',
    category: 'documentation',
    command: 'vscode-explain',
    keep: '日本語',
  });
  await openApp(page, `?${params}#catalog`);
  await expect(search(page)).toHaveValue('/explain 説明');
  await expect(page.locator('#category-filter')).toHaveValue('documentation');
  await expect(environmentButton(page, 'vscode')).toHaveAttribute('aria-pressed', 'true');
  await expect(row(page, 'vscode-explain')).toHaveAttribute('aria-pressed', 'true');
  await expect(page.locator('#detail-title')).toHaveText('/explain');
  await expectResults(page, {
    query: '/explain 説明',
    environment: 'vscode',
    category: 'documentation',
  });
  await search(page).fill('説明');
  await expectParameter(page, 'command', null);
  await expectParameter(page, 'keep', '日本語');
  expect(new URL(page.url()).pathname).toBe('/Github-Copilot-Slash-Command-Chart/');
  expect(new URL(page.url()).hash).toBe('#catalog');
  await page.reload();
  await expect(search(page)).toHaveValue('説明');
  await expectResults(page, {
    query: '説明',
    environment: 'vscode',
    category: 'documentation',
  });
});

test('invalid and duplicate URL parameters are corrected with a visible notice', async ({
  page,
}) => {
  await openApp(
    page,
    '?q=explain&q=fix&env=unknown&env=vscode&category=unknown&category=documentation' +
      '&command=missing&command=vscode-explain&keep=one&keep=two#catalog',
  );
  const notice = page.locator('#url-notice');
  await expect(notice).toBeVisible();
  await expect(notice).toContainText('重複');
  await expect(notice).toContainText('選択を解除');
  await expectResults(page, { query: 'explain' });
  await expect(page.locator('#detail-title')).toHaveCount(0);
  await expectParameter(page, 'env', null);
  await expectParameter(page, 'category', null);
  await expectParameter(page, 'command', null);
  const corrected = new URL(page.url());
  expect(corrected.searchParams.getAll('q')).toEqual(['explain']);
  expect(corrected.searchParams.getAll('keep')).toEqual(['one', 'two']);
  expect(corrected.hash).toBe('#catalog');
  await search(page).fill('clear');
  await expect(notice).toBeHidden();
});

test('direct URL cannot display a selected command excluded by its filters', async ({ page }) => {
  await openApp(page, '?env=cli&command=vscode-explain');
  await expect(page.locator('#url-notice')).toBeVisible();
  await expect(page.locator('#url-notice')).toContainText('検索結果にない');
  await expect(page.locator('#detail-title')).toHaveCount(0);
  await expectResults(page, { environment: 'cli' });
  await expectParameter(page, 'command', null);
});

test('selection and environment navigation restore correctly with browser back and forward', async ({
  page,
}) => {
  await openApp(page, '?q=explain');
  await row(page, 'vscode-explain').click();
  await expect(page.locator('#detail-title')).toBeFocused();
  await expectParameter(page, 'command', 'vscode-explain');
  await page.goBack();
  await expectParameter(page, 'command', null);
  await expect(page.locator('#detail-title')).toHaveCount(0);
  await expectResults(page, { query: 'explain' });
  await page.goForward();
  await expectParameter(page, 'command', 'vscode-explain');
  await expect(page.locator('#detail-title')).toHaveText('/explain');
  await expect(row(page, 'vscode-explain')).toHaveAttribute('aria-pressed', 'true');

  await environmentButton(page, 'cli').click();
  await expectParameter(page, 'command', null);
  await expectResults(page, { query: 'explain', environment: 'cli' });
  await page.goBack();
  await expectParameter(page, 'command', 'vscode-explain');
  await expect(environmentButton(page, 'all')).toHaveAttribute('aria-pressed', 'true');
  await expect(page.locator('#detail-title')).toHaveText('/explain');
  await page.goForward();
  await expectParameter(page, 'env', 'cli');
  await expect(page.locator('#detail-title')).toHaveCount(0);
});

test('typing replaces history while environment, category and selection push history', async ({
  page,
}) => {
  await openApp(page);
  const initialHistory = await page.evaluate(() => history.length);
  await search(page).fill('説明');
  await search(page).fill('explain');
  await expectParameter(page, 'q', 'explain');
  expect(await page.evaluate(() => history.length)).toBe(initialHistory);
  await environmentButton(page, 'vscode').click();
  expect(await page.evaluate(() => history.length)).toBe(initialHistory + 1);
  await page.locator('#category-filter').selectOption('documentation');
  expect(await page.evaluate(() => history.length)).toBe(initialHistory + 2);
  await row(page, 'vscode-explain').click();
  expect(await page.evaluate(() => history.length)).toBe(initialHistory + 3);
});

for (const change of ['search', 'environment', 'category'] as const) {
  test(`${change} changes clear selection even when the record would still match`, async ({
    page,
  }) => {
    await openApp(page, '?command=vscode-explain');
    await expect(page.locator('#detail-title')).toHaveText('/explain');
    if (change === 'search') await search(page).fill('explain');
    if (change === 'environment') await environmentButton(page, 'vscode').click();
    if (change === 'category') await page.locator('#category-filter').selectOption('documentation');
    await expectParameter(page, 'command', null);
    await expect(page.locator('#detail-title')).toHaveCount(0);
    await expect(row(page, 'vscode-explain')).toHaveAttribute('aria-pressed', 'false');
  });
}

test('closing a detail clears URL selection and restores focus to the command row', async ({
  page,
}) => {
  await openApp(page, '?env=cli');
  await row(page, 'cli-clear').click();
  await expect(page.locator('#detail-title')).toHaveText('/clear');
  await expect(page.locator('#detail-title')).toBeFocused();
  await page.getByRole('button', { name: '詳細を閉じる', exact: true }).click();
  await expect(page.locator('#detail-title')).toHaveCount(0);
  await expect(row(page, 'cli-clear')).toHaveAttribute('aria-pressed', 'false');
  await expect(row(page, 'cli-clear')).toBeFocused();
  await expectParameter(page, 'command', null);
  await expectParameter(page, 'env', 'cli');
});
