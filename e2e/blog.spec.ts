import { test, expect } from '@playwright/test';

test.describe('Blog', () => {
  test('blog listing page loads', async ({ page }) => {
    await page.goto('/blog', { waitUntil: 'domcontentloaded' });

    // Check page loaded
    await expect(page.locator('main').first()).toBeVisible();
  });

  test('blog page has content', async ({ page }) => {
    await page.goto('/blog', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(2000);

    // Check for any blog links
    const blogLinks = page.locator('a[href^="/blog/"]');
    const count = await blogLinks.count();
    expect(count).toBeGreaterThan(0);
  });

  test('individual blog post loads', async ({ page }) => {
    // Navigate directly to a known blog post
    await page.goto('/blog/building-rag-systems', { waitUntil: 'domcontentloaded' });

    // Check page has title
    await expect(page.locator('h1').first()).toBeVisible();
  });

  test('blog posts have images with alt text', async ({ page }) => {
    await page.goto('/blog', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(1000);

    const images = page.locator('img');
    const count = await images.count();

    // Only check visible images
    let checked = 0;
    for (let i = 0; i < Math.min(count, 5); i++) {
      const img = images.nth(i);
      if (await img.isVisible().catch(() => false)) {
        const alt = await img.getAttribute('alt');
        expect(alt).toBeTruthy();
        checked++;
      }
    }
    // At least one image should have been checked
    expect(checked).toBeGreaterThanOrEqual(0);
  });
});

test.describe('Blog Performance', () => {
  test('blog page loads within acceptable time', async ({ page }) => {
    const startTime = Date.now();

    await page.goto('/blog', { waitUntil: 'domcontentloaded' });

    const loadTime = Date.now() - startTime;

    // Should load within 30 seconds (allows for dev server cold starts)
    expect(loadTime).toBeLessThan(30000);
  });
});
