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

for (const width of [320, 390, 768, 1440]) {
  for (const theme of ['light', 'dark'] as const) {
    test(`${width}px ${theme} keeps the header controls and footer notices readable`, async ({
      page,
    }) => {
      await page.setViewportSize({ width, height: 844 });
      await page.emulateMedia({ colorScheme: theme });
      await openApp(page);
      await expect(page.locator('html')).toHaveAttribute('data-theme', theme);
      const header = page.getByRole('banner');
      const brand = header.getByRole('link', {
        name: 'GitHub Copilot Slash Command Chart ホーム',
        exact: true,
      });
      const toggle = header.getByRole('button', {
        name: `${theme === 'light' ? 'ダーク' : 'ライト'}テーマに切り替える`,
        exact: true,
      });
      for (const element of [
        brand,
        toggle,
        header.getByRole('link', { name: /GitHub.*新しいタブ/u }),
        header.getByText('非公式・個人運営', { exact: true }),
        header.getByText('公式資料の確認', { exact: false }),
      ]) {
        await expect(element).toBeVisible();
        await expect(element).toBeInViewport();
        const bounds = await element.boundingBox();
        if (!bounds) throw new Error('A visible header element must have bounds.');
        expect(bounds.x).toBeGreaterThanOrEqual(0);
        expect(bounds.x + bounds.width).toBeLessThanOrEqual(width);
      }
      const brandBounds = await brand.boundingBox();
      const toggleBounds = await toggle.boundingBox();
      if (!brandBounds || !toggleBounds) throw new Error('Header controls must have bounds.');
      expect(brandBounds.x + brandBounds.width).toBeLessThanOrEqual(toggleBounds.x);
      await expectNoHorizontalOverflow(page);
      await toggle.click();
      await expect(page.locator('html')).toHaveAttribute(
        'data-theme',
        theme === 'light' ? 'dark' : 'light',
      );
      const footer = page.getByRole('contentinfo');
      for (const element of [
        footer.getByText('© 2026 matayuuu', { exact: true }),
        footer.getByText('GitHub・Microsoftとは提携しておらず、両社の承認・後援を受けていません。'),
      ]) {
        await element.scrollIntoViewIfNeeded();
        await expect(element).toBeInViewport();
        const bounds = await element.boundingBox();
        if (!bounds) throw new Error('A visible footer notice must have bounds.');
        expect(bounds.x).toBeGreaterThanOrEqual(0);
        expect(bounds.x + bounds.width).toBeLessThanOrEqual(width);
      }
      await expectNoHorizontalOverflow(page);
    });
  }
}
