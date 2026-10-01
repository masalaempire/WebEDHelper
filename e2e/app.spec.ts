import { test, expect } from '@playwright/test';
import { mkdir } from 'node:fs/promises';
test('directory search, combined categories, and clear filters', async ({ page }, info) => {
  await page.goto('/');
  await expect(page.getByTestId('resource-card')).toHaveCount(42);
  await page.getByRole('searchbox', { name: 'Search resources' }).fill('  CARRIER  TRITIUM ');
  await expect(page.getByRole('heading', { name: 'Spansh', exact: true })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'EDSY', exact: true })).toHaveCount(0);
  if (info.project.name === 'mobile') await page.getByRole('button', { name: 'Filters', exact: true }).click();
  const categories = page.getByRole('group', { name: 'Categories', exact: true });
  await categories.getByRole('button', { name: /^Fleet Carriers/ }).click();
  await categories.getByRole('button', { name: /^Exploration/ }).click();
  await expect(page.getByRole('heading', { name: 'Spansh', exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Clear filters', exact: true }).click();
  await expect(page.getByTestId('resource-card')).toHaveCount(42);
  await page.getByRole('searchbox', { name: 'Search resources' }).fill('zz-unfindable-zz');
  await expect(page.getByRole('heading', { name: 'No resources found' })).toBeVisible();
});
test('favorites persist, reorder, and appear on Saved', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Save Spansh to favorites', exact: true }).click();
  await expect(page.getByTestId('resource-card').first()).toContainText('Spansh');
  await page.reload();
  await expect(page.getByRole('button', { name: 'Remove Spansh from favorites' })).toHaveAttribute('aria-pressed', 'true');
  await page.getByRole('button', { name: 'Favorites only' }).click();
  await expect(page.getByTestId('resource-card')).toHaveCount(1);
  await page.getByRole('link', { name: /^Saved/ }).click();
  await expect(page.getByRole('heading', { name: 'Spansh', exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Remove Spansh from favorites' }).click();
  await expect(page.getByRole('heading', { name: 'Your favorites start with a star' })).toBeVisible();
});
test('custom bookmarks validate, preserve links, edit, filter, and delete', async ({ page }) => {
  await page.goto('/saved');
  await page.getByRole('button', { name: 'Add bookmark', exact: true }).click();
  const dialog = page.getByRole('dialog', { name: 'Save a new link' });
  await dialog.getByLabel('Name', { exact: true }).fill('My Mandalay');
  await dialog.getByLabel('URL', { exact: true }).fill('javascript:alert(1)');
  await dialog.getByRole('button', { name: 'Save bookmark', exact: true }).click();
  await expect(dialog.getByRole('alert')).toContainText('full URL');
  await dialog.getByLabel('URL', { exact: true }).fill('https://edsy.org/?test=1#mandalay');
  await dialog.getByLabel('Description', { exact: true }).fill('Long range build');
  await dialog.getByRole('button', { name: 'Ships', exact: true }).click();
  await dialog.getByLabel(/^Tags/).fill('range, exploration');
  await dialog.getByRole('button', { name: 'Save bookmark', exact: true }).click();
  await expect(page.getByRole('link', { name: 'Open bookmark My Mandalay (new tab)' })).toHaveAttribute('href', 'https://edsy.org/?test=1#mandalay');
  await page.reload();
  await page.getByRole('button', { name: 'Edit My Mandalay', exact: true }).click();
  await page.getByRole('dialog').getByLabel('Name', { exact: true }).fill('Expedition Mandalay');
  await page.getByRole('button', { name: 'Save bookmark', exact: true }).click();
  await page.getByRole('searchbox', { name: 'Search saved links' }).fill('range');
  await expect(page.getByTestId('bookmark-card')).toHaveCount(1);
  await page.getByRole('combobox', { name: 'Filter saved links by category' }).selectOption('Mining');
  await expect(page.getByRole('heading', { name: 'No personal bookmarks match' })).toBeVisible();
  await page.getByRole('button', { name: 'Clear filters', exact: true }).click();
  await page.getByRole('button', { name: 'Delete Expedition Mandalay' }).click();
  await page.getByRole('button', { name: 'Keep bookmark' }).click();
  await expect(page.getByTestId('bookmark-card')).toHaveCount(1);
  await page.getByRole('button', { name: 'Delete Expedition Mandalay' }).click();
  await page.getByRole('button', { name: 'Delete bookmark', exact: true }).click();
  await page.reload();
  await expect(page.getByTestId('bookmark-card')).toHaveCount(0);
});
test('theme persists and routes support direct navigation and refresh', async ({ page }) => {
  await page.goto('/tools');
  await expect(page.getByRole('heading', { name: 'What are we doing today?' })).toBeVisible();
  await page.getByRole('combobox', { name: 'Color theme' }).selectOption('dark');
  await page.reload();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  await page.goto('/saved'); await page.reload();
  await expect(page.getByRole('heading', { name: 'Keep the good ones close.' })).toBeVisible();
  await page.goto('/missing-page'); await page.reload();
  await expect(page.getByRole('heading', { name: 'A little off course?' })).toBeVisible();
});
test('tool categories and outbound links work', async ({ page }) => {
  await page.goto('/tools');
  await expect(page.locator('.task-card')).toHaveCount(16);
  await page.getByRole('group', { name: 'Filter tasks' }).getByRole('button', { name: 'Rescue', exact: true }).click();
  await expect(page.locator('.task-card')).toHaveCount(2);
  await expect(page.getByRole('link', { name: 'Open tool: Get fuel rescue (new tab)' })).toHaveAttribute('href', 'https://fuelrats.com/');
  for (const link of await page.locator('a[target="_blank"]').all()) await expect(link).toHaveAttribute('rel', 'noopener noreferrer');
});
test('corrupt saved data leaves the directory usable', async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem('mini-elite-helper:v1', '{corrupt'));
  await page.goto('/');
  await expect(page.getByRole('alert')).toContainText('could not be read');
  await expect(page.getByTestId('resource-card')).toHaveCount(42);
});
test('blocked storage keeps changes available for the visit', async ({ page }) => {
  await page.addInitScript(() => {
    Storage.prototype.getItem = () => { throw new DOMException('blocked', 'SecurityError'); };
    Storage.prototype.setItem = () => { throw new DOMException('blocked', 'SecurityError'); };
  });
  await page.goto('/');
  await page.getByRole('button', { name: 'Save Spansh to favorites', exact: true }).click();
  await expect(page.getByRole('alert')).toContainText('could not save');
  await page.getByRole('link', { name: /^Saved/ }).click();
  await expect(page.getByRole('heading', { name: 'Spansh', exact: true })).toBeVisible();
});
test('keyboard shortcut, focus, and responsive layout', async ({ page }, info) => {
  await page.goto('/');
  if (info.project.name === 'desktop') {
    await page.keyboard.press('/');
    await expect(page.getByRole('searchbox', { name: 'Search resources' })).toBeFocused();
    await page.keyboard.press('Tab');
    await expect(page.getByRole('button', { name: 'Favorites only' })).toBeFocused();
  }
  for (const path of ['/', '/tools', '/saved']) {
    await page.goto(path);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  }
});
test('capture remote review screenshots', async ({ page }, info) => {
  await mkdir('reports/screenshots', { recursive: true });
  await page.addInitScript(() => localStorage.setItem('mini-elite-helper:v1', JSON.stringify({
    version: 1, favorites: ['spansh', 'edsy'], theme: 'light',
    bookmarks: [{ id: 'review-build', name: 'Expedition Mandalay', url: 'https://edsy.org/#review-build', description: 'My long-range exploration build. Ready for the next trip out of the Bubble.', categories: ['Ships', 'Exploration'], tags: ['Long range'] }],
  })));
  await page.goto('/');
  for (const theme of ['light', 'dark']) {
    await page.getByRole('combobox', { name: 'Color theme' }).selectOption(theme);
    for (const [path, name] of [['/', 'directory'], ['/tools', 'tools'], ['/saved', 'saved']]) {
      await page.getByRole('link', { name: name === 'directory' ? 'Directory' : name === 'tools' ? 'Tools' : /^Saved/ , exact: name !== 'saved' }).click();
      await expect(page.locator('html')).toHaveAttribute('data-theme', theme);
      await page.screenshot({ path: 'reports/screenshots/' + info.project.name + '-' + name + '-' + theme + '.png', animations: 'disabled' });
    }
  }
});
