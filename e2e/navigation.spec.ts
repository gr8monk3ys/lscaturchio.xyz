import { test, expect } from '@playwright/test';

test.describe('Navigation', () => {
  test('homepage loads correctly', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');

    // Wait for React hydration
    await page.waitForTimeout(2000);

    // Check main content exists (title may be set dynamically)
    await expect(page.locator('main').first()).toBeVisible();

    // Check hero section or main heading
    const headings = page.locator('h1, h2');
    const count = await headings.count();
    expect(count).toBeGreaterThan(0);
  });

  test('can navigate to blog page', async ({ page }) => {
    await page.goto('/blog');
    await page.waitForLoadState('domcontentloaded');

    // Verify we're on the blog page
    await expect(page).toHaveURL('/blog');
  });

  test('can navigate to about page', async ({ page }) => {
    await page.goto('/about');
    await page.waitForLoadState('domcontentloaded');

    await expect(page).toHaveURL('/about');
    await expect(page.locator('main').first()).toBeVisible();
  });

  test('can navigate to projects page', async ({ page }) => {
    await page.goto('/projects');
    await page.waitForLoadState('domcontentloaded');

    await expect(page).toHaveURL('/projects');
    await expect(page.locator('main').first()).toBeVisible();
  });

  test('can navigate to contact page', async ({ page }) => {
    await page.goto('/contact');
    await page.waitForLoadState('domcontentloaded');

    await expect(page).toHaveURL('/contact');
    await expect(page.locator('main').first()).toBeVisible();
  });

  test('404 page shows for invalid routes', async ({ page }) => {
    await page.goto('/this-page-does-not-exist');
    await page.waitForLoadState('domcontentloaded');

    // Check for 404 content
    await expect(page.getByText('404')).toBeVisible();
  });

  test('skip to content link exists', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');

    // Check skip link exists in DOM
    const skipLink = page.locator('a[href="#main-content"]');
    await expect(skipLink).toBeAttached();
  });
});

test.describe('Search', () => {
  test('search button exists', async ({ page, isMobile }) => {
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(1000);

    if (isMobile) {
      // On mobile, search may be in hamburger menu - check it exists in DOM
      const searchElement = page.locator('[aria-label*="earch" i]').first();
      await expect(searchElement).toBeAttached({ timeout: 5000 });
    } else {
      // On desktop, search button should be visible
      const searchElement = page.locator('[aria-label*="earch" i], button:has-text("Search"), input[placeholder*="earch" i]').first();
      await expect(searchElement).toBeVisible({ timeout: 5000 });
    }
  });
});
