import { test, expect } from '@playwright/test';

test.describe('Blog', () => {
  test('blog listing page shows posts', async ({ page }) => {
    await page.goto('/blog');
    await page.waitForLoadState('domcontentloaded');

    // Check for blog posts
    const blogCards = page.locator('article, [data-testid="blog-card"], a[href^="/blog/"]');
    await expect(blogCards.first()).toBeVisible({ timeout: 10000 });
  });

  test('can click into a blog post', async ({ page }) => {
    await page.goto('/blog');
    await page.waitForLoadState('domcontentloaded');

    // Get first blog link
    const firstBlogLink = page.locator('a[href^="/blog/"]').first();
    await expect(firstBlogLink).toBeVisible({ timeout: 10000 });
    const href = await firstBlogLink.getAttribute('href');

    await firstBlogLink.click();

    // Verify we navigated to the blog post
    await expect(page).toHaveURL(new RegExp(href || '/blog/'));

    // Check blog content loaded
    await expect(page.locator('article, main').first()).toBeVisible({ timeout: 10000 });
  });

  test('blog post has required elements', async ({ page }) => {
    await page.goto('/blog');
    await page.waitForLoadState('domcontentloaded');

    // Navigate to first blog post
    const firstBlogLink = page.locator('a[href^="/blog/"]').first();
    await expect(firstBlogLink).toBeVisible({ timeout: 10000 });
    await firstBlogLink.click();

    // Wait for navigation
    await page.waitForLoadState('domcontentloaded');

    // Check for title
    await expect(page.locator('h1').first()).toBeVisible({ timeout: 10000 });

    // Check for content
    await expect(page.locator('article, .prose, main').first()).toBeVisible({ timeout: 10000 });
  });

  test('dark mode toggle works', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');

    // Find and click theme toggle
    const themeToggle = page.locator('button[aria-label*="theme"], button[aria-label*="mode"], [data-testid="theme-toggle"]').first();

    // Wait for theme toggle to be available
    const isVisible = await themeToggle.isVisible({ timeout: 5000 }).catch(() => false);

    if (isVisible) {
      const htmlBefore = await page.locator('html').getAttribute('class');

      await themeToggle.click();

      // Wait for theme change
      await page.waitForTimeout(500);

      const htmlAfter = await page.locator('html').getAttribute('class');

      // Theme should have changed
      expect(htmlBefore).not.toEqual(htmlAfter);
    }
  });
});

test.describe('Blog Performance', () => {
  test('blog page loads within acceptable time', async ({ page }) => {
    const startTime = Date.now();

    await page.goto('/blog');
    await page.waitForLoadState('domcontentloaded');

    const loadTime = Date.now() - startTime;

    // Should load within 10 seconds (CI can be slower)
    expect(loadTime).toBeLessThan(10000);
  });

  test('images have alt text', async ({ page }) => {
    await page.goto('/blog');
    await page.waitForLoadState('domcontentloaded');

    // Wait for images to load
    await page.waitForTimeout(1000);

    const images = page.locator('img');
    const count = await images.count();

    // Only check if images exist
    if (count > 0) {
      for (let i = 0; i < Math.min(count, 10); i++) {
        const alt = await images.nth(i).getAttribute('alt');
        expect(alt).toBeTruthy();
      }
    }
  });
});
