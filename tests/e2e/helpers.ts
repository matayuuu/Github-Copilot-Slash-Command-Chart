import { expect } from '@playwright/test';
import type { Page } from '@playwright/test';
import { filterCommands } from '../../src/catalog/search';
import { environmentIds } from '../../src/catalog/types';
import type { CatalogState } from '../../src/catalog/types';
import { initialState } from '../../src/catalog/url-state';
import { commands } from '../../src/data';

export const rows = (page: Page) => page.locator('#command-list button.command-row');
export const search = (page: Page) => page.getByRole('searchbox', { name: 'コマンドを検索' });
export const row = (page: Page, id: string) =>
  page.locator(`#command-list button.command-row[data-command-id="${id}"]`);
export const environmentButton = (page: Page, id: string) =>
  page.locator(`#environment-filters button[data-environment="${id}"]`);

export function catalogCommand(id: string) {
  const command = commands.find((item) => item.id === id);
  if (!command) throw new Error(`The catalog must include the stable record ${id}.`);
  return command;
}

export async function openApp(page: Page, relativeUrl = './') {
  await page.goto(relativeUrl);
  await expect(page.locator('#environment-filters button[data-environment]')).toHaveCount(
    environmentIds.length + 1,
  );
  await expect(search(page)).toBeVisible();
}

export async function expectResults(page: Page, filters: Partial<CatalogState> = {}) {
  const expected = filterCommands(commands, { ...initialState, ...filters });
  await expect(rows(page)).toHaveCount(expected.length);
  await expect
    .poll(() =>
      rows(page).evaluateAll((elements) =>
        elements.map((element) => element.getAttribute('data-command-id')),
      ),
    )
    .toEqual(expected.map((command) => command.id));
  await expect(page.locator('#result-count')).toHaveText(
    new RegExp(`^\\s*${expected.length}\\s*件\\s*$`, 'u'),
  );
}

export async function expectParameter(page: Page, key: string, value: string | null) {
  await expect.poll(() => new URL(page.url()).searchParams.get(key)).toBe(value);
}

export async function denyClipboard(page: Page) {
  await page.addInitScript(() => {
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: {
        writeText: async () => {
          throw new DOMException('Clipboard write denied for this test', 'NotAllowedError');
        },
      },
    });
  });
}
