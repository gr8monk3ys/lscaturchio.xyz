import { test, expect } from '@playwright/test';

test.describe('Blog', () => {
  test('blog listing page shows posts', async ({ page }) => {
    await page.goto('/blog');

    // Check for blog posts
    const blogCards = page.locator('article, [data-testid="blog-card"], a[href^="/blog/"]');
    await expect(blogCards.first()).toBeVisible();
  });

  test('can click into a blog post', async ({ page }) => {
    await page.goto('/blog');

    // Get first blog link
    const firstBlogLink = page.locator('a[href^="/blog/"]').first();
    const href = await firstBlogLink.getAttribute('href');

    await firstBlogLink.click();

    // Verify we navigated to the blog post
    await expect(page).toHaveURL(new RegExp(href || '/blog/'));

    // Check blog content loaded
    await expect(page.locator('article, main')).toBeVisible();
  });

  test('blog post has required elements', async ({ page }) => {
    await page.goto('/blog');

    // Navigate to first blog post
    await page.locator('a[href^="/blog/"]').first().click();

    // Check for title
    await expect(page.locator('h1').first()).toBeVisible();

    // Check for content
    await expect(page.locator('article, .prose, main')).toBeVisible();
  });

  test('dark mode toggle works', async ({ page }) => {
    await page.goto('/');

    // Find and click theme toggle
    const themeToggle = page.locator('button[aria-label*="theme"], button[aria-label*="mode"], [data-testid="theme-toggle"]').first();

    if (await themeToggle.isVisible()) {
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

    // Should load within 5 seconds
    expect(loadTime).toBeLessThan(5000);
  });

  test('images have alt text', async ({ page }) => {
    await page.goto('/blog');

    const images = page.locator('img');
    const count = await images.count();

    for (let i = 0; i < Math.min(count, 10); i++) {
      const alt = await images.nth(i).getAttribute('alt');
      expect(alt).toBeTruthy();
    }
  });
});
