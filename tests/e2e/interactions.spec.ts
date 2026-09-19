import { expect, test } from '@playwright/test';
import { createStateUrl, initialState } from '../../src/catalog/url-state';
import {
  catalogCommand,
  denyClipboard,
  expectParameter,
  expectResults,
  openApp,
  row,
  search,
} from './helpers';

test('keyboard users can focus search with slash and select a command with Enter', async ({
  page,
}) => {
  await openApp(page);
  await page.locator('#theme-toggle').focus();
  await page.keyboard.press('/');
  await expect(search(page)).toBeFocused();
  await expect(search(page)).toHaveValue('');
  await search(page).fill('/explain');
  await row(page, 'vscode-explain').focus();
  await page.keyboard.press('Enter');
  await expect(page.locator('#detail-title')).toBeFocused();
  await expect(row(page, 'vscode-explain')).toHaveAttribute('aria-pressed', 'true');
  await expectParameter(page, 'command', 'vscode-explain');
});

test('slash never steals focus from text input, native select or contenteditable', async ({
  page,
}) => {
  await openApp(page);
  await search(page).focus();
  await page.keyboard.press('/');
  await expect(search(page)).toHaveValue('/');
  await expect(search(page)).toBeFocused();
  await page.locator('#category-filter').focus();
  await page.keyboard.press('/');
  await expect(page.locator('#category-filter')).toBeFocused();

  const heading = page.locator('#page-title');
  await heading.evaluate((element) => {
    element.setAttribute('contenteditable', 'true');
    element.setAttribute('tabindex', '0');
  });
  await heading.focus();
  await page.keyboard.press('/');
  await expect(heading).toBeFocused();
  await expect(search(page)).not.toBeFocused();
});

test('composition does not trigger slash shortcuts or filter intermediate IME text', async ({
  page,
}) => {
  await openApp(page);
  const theme = page.locator('#theme-toggle');
  await theme.focus();
  await theme.dispatchEvent('keydown', { key: '/', bubbles: true, isComposing: true });
  await expect(theme).toBeFocused();
  await expect(search(page)).not.toBeFocused();

  await search(page).focus();
  await search(page).dispatchEvent('compositionstart');
  await search(page).evaluate((element) => {
    if (!(element instanceof HTMLInputElement)) throw new Error('Search must be a native input.');
    element.value = '説明';
    element.dispatchEvent(
      new InputEvent('input', {
        bubbles: true,
        inputType: 'insertCompositionText',
        data: '説明',
        isComposing: true,
      }),
    );
  });
  await expectParameter(page, 'q', null);
  await expectResults(page);
  await search(page).dispatchEvent('compositionend', { data: '説明' });
  await expectParameter(page, 'q', '説明');
  await expectResults(page, { query: '説明' });
});

test('denied clipboard writes offer selectable command, example and share URL text', async ({
  page,
}) => {
  await denyClipboard(page);
  await openApp(page, '?env=vscode&command=vscode-explain&keep=日本語#details');
  const command = catalogCommand('vscode-explain');
  const example = command.examples[0];
  if (!example) throw new Error('The selected command must have a usage example.');
  const copyCases = [
    { name: 'コマンドをコピー', expected: command.syntax },
    { name: '使用例をコピー', expected: example.prompt },
    {
      name: '検索URLをコピー',
      expected: createStateUrl(new URL(page.url()), {
        ...initialState,
        environment: 'vscode',
        selectedId: command.id,
      }).href,
    },
  ];
  for (const item of copyCases) {
    await test.step(item.name, async () => {
      await page.getByRole('button', { name: item.name, exact: true }).first().click();
      await expect(page.locator('#copy-dialog')).toBeVisible();
      await expect(page.locator('#copy-text')).toHaveValue(item.expected);
      await expect(page.locator('#copy-text')).toBeFocused();
      await expect(page.locator('#copy-text')).toHaveAttribute('readonly', '');
      expect(
        await page.locator('#copy-text').evaluate((element) => {
          if (!(element instanceof HTMLTextAreaElement)) throw new Error('Expected a textarea.');
          return [element.selectionStart, element.selectionEnd];
        }),
      ).toEqual([0, item.expected.length]);
      await expect(page.locator('#toast')).toContainText('自動コピーができませんでした');
      await page.keyboard.press('/');
      await expect(page.locator('#copy-text')).toBeFocused();
      await page.locator('#copy-close').click();
      await expect(page.locator('#copy-dialog')).toBeHidden();
    });
  }
});

test('missing Clipboard API follows the same recoverable fallback', async ({ page }) => {
  await page.addInitScript(() => {
    Object.defineProperty(navigator, 'clipboard', { configurable: true, value: undefined });
  });
  await openApp(page, '?command=cli-clear');
  await page.getByRole('button', { name: 'コマンドをコピー', exact: true }).click();
  await expect(page.locator('#copy-dialog')).toBeVisible();
  await expect(page.locator('#copy-text')).toHaveValue(catalogCommand('cli-clear').syntax);
  await page.keyboard.press('Escape');
  await expect(page.locator('#copy-dialog')).toBeHidden();
});

test('successful clipboard writes copy exact text and report success without a dialog', async ({
  page,
}) => {
  // Per-page clipboard capture avoids races with the machine's shared native clipboard.
  await page.addInitScript(() => {
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: {
        writeText: async (text: string) => {
          document.documentElement.dataset.testClipboard = text;
        },
      },
    });
  });
  await openApp(page, '?q=explain&command=vscode-explain&keep=1#catalog');
  const command = catalogCommand('vscode-explain');
  const example = command.examples[0];
  if (!example) throw new Error('The selected command must have a usage example.');
  for (const item of [
    { name: 'コマンドをコピー', expected: command.syntax, label: 'コマンド' },
    { name: '使用例をコピー', expected: example.prompt, label: '使用例' },
    {
      name: '検索URLをコピー',
      expected: createStateUrl(new URL(page.url()), {
        ...initialState,
        query: 'explain',
        selectedId: command.id,
      }).href,
      label: '検索URL',
    },
  ]) {
    await page.getByRole('button', { name: item.name, exact: true }).first().click();
    await expect(page.locator('html')).toHaveAttribute('data-test-clipboard', item.expected);
    await expect(page.locator('#toast')).toHaveText(`${item.label}をコピーしました`);
    await expect(page.locator('#copy-dialog')).toBeHidden();
  }
});

for (const initialTheme of ['light', 'dark'] as const) {
  test(`theme follows the ${initialTheme} OS preference and can be toggled accessibly`, async ({
    page,
  }) => {
    await page.emulateMedia({ colorScheme: initialTheme });
    await openApp(page);
    const otherTheme = initialTheme === 'light' ? 'dark' : 'light';
    await expect(page.locator('html')).toHaveAttribute('data-theme', initialTheme);
    const theme = page.locator('#theme-toggle');
    await expect(theme).toHaveAccessibleName(/テーマ/u);
    await theme.click();
    await expect(page.locator('html')).toHaveAttribute('data-theme', otherTheme);
    await theme.focus();
    await page.keyboard.press('Enter');
    await expect(page.locator('html')).toHaveAttribute('data-theme', initialTheme);
  });
}
