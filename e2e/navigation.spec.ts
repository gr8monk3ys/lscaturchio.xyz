import { test, expect } from '@playwright/test';

test.describe('Navigation', () => {
  test('homepage loads correctly', async ({ page }) => {
    await page.goto('/');

    // Wait for page to fully load
    await page.waitForLoadState('domcontentloaded');

    // Check title
    await expect(page).toHaveTitle(/Lorenzo/i);

    // Check hero section exists
    await expect(page.locator('main')).toBeVisible();
  });

  test('can navigate to blog page', async ({ page }) => {
    await page.goto('/');

    // Click blog link in navigation
    await page.click('a[href="/blog"]');

    // Verify we're on the blog page
    await expect(page).toHaveURL('/blog');
    await expect(page.locator('h1, h2').first()).toBeVisible();
  });

  test('can navigate to about page', async ({ page }) => {
    await page.goto('/');

    await page.click('a[href="/about"]');

    await expect(page).toHaveURL('/about');
  });

  test('can navigate to projects page', async ({ page }) => {
    await page.goto('/');

    await page.click('a[href="/projects"]');

    await expect(page).toHaveURL('/projects');
  });

  test('can navigate to contact page', async ({ page }) => {
    await page.goto('/');

    await page.click('a[href="/contact"]');

    await expect(page).toHaveURL('/contact');
  });

  test('404 page shows for invalid routes', async ({ page }) => {
    await page.goto('/this-page-does-not-exist');

    // Check for 404 content
    await expect(page.getByText('404')).toBeVisible();
    await expect(page.getByText(/page not found/i)).toBeVisible();
  });

  test('skip to content link works', async ({ page }) => {
    await page.goto('/');

    // Tab to focus on skip link
    await page.keyboard.press('Tab');

    // Check skip link becomes visible on focus
    const skipLink = page.locator('a[href="#main-content"]');
    await expect(skipLink).toBeFocused();
  });
});

test.describe('Search', () => {
  test('can open search with keyboard shortcut', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');

    // Press Ctrl+K (works on both Linux CI and macOS)
    await page.keyboard.press('Control+k');

    // Check search dialog is open
    await expect(page.locator('input[placeholder*="Search"]')).toBeVisible();
  });

  test('can close search with Escape', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');

    await page.keyboard.press('Control+k');
    await expect(page.locator('input[placeholder*="Search"]')).toBeVisible();

    await page.keyboard.press('Escape');
    await expect(page.locator('input[placeholder*="Search"]')).not.toBeVisible();
  });
});
