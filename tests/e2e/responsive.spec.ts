import { expect, test } from '@playwright/test';
import type { Page } from '@playwright/test';
import { denyClipboard, openApp, row } from './helpers';

async function expectNoHorizontalOverflow(page: Page) {
  await expect
    .poll(() =>
      page.evaluate(
        () =>
          Math.max(document.documentElement.scrollWidth, document.body.scrollWidth) -
          document.documentElement.clientWidth,
      ),
    )
    .toBeLessThanOrEqual(1);
}

for (const width of [320, 390]) {
  test(`${width}px layout has no horizontal overflow and scrolls selected detail into view`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 844 });
    await denyClipboard(page);
    await openApp(page, '?q=explain');
    await expectNoHorizontalOverflow(page);
    await row(page, 'vscode-explain').click();
    await expect(page.locator('#detail-title')).toHaveText('/explain');
    await expect(page.locator('#detail-title')).toBeFocused();
    await expect(page.locator('#detail-title')).toBeInViewport();
    await expect(page.locator('#detail-pane')).not.toHaveAttribute('role', 'dialog');
    await expect(page.locator('dialog[open]')).toHaveCount(0);
    await expectNoHorizontalOverflow(page);

    await page.getByRole('button', { name: '検索URLをコピー', exact: true }).click();
    await expect(page.locator('#copy-dialog')).toBeVisible();
    await expect(page.locator('#copy-text')).toBeInViewport();
    await expectNoHorizontalOverflow(page);
    await page.locator('#copy-close').click();
    await page.locator('#sources-open').click();
    await expect(page.locator('#sources-dialog')).toBeVisible();
    await expect(page.locator('#sources-close')).toBeInViewport();
    await expectNoHorizontalOverflow(page);
    await page.locator('#sources-close').click();
  });
}
