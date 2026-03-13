import { test, expect } from '@playwright/test';

test.describe('Newsletter Subscription', () => {
  test('newsletter form is visible on a blog post', async ({ page }) => {
    await page.goto('/blog/building-rag-systems', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(2000);

    const emailInput = page.locator('input[aria-label="Email address"]').first();
    await expect(emailInput).toBeVisible({ timeout: 10000 });
  });

  test('can fill in email field', async ({ page }) => {
    await page.goto('/blog/building-rag-systems', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(2000);

    const emailInput = page.locator('input[aria-label="Email address"]').first();
    await emailInput.fill('test@example.com');
    await expect(emailInput).toHaveValue('test@example.com');
  });

  test('successful subscription shows success message', async ({ page }) => {
    await page.route('**/api/newsletter/subscribe', (route) => {
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ message: 'Successfully subscribed!' }),
      });
    });

    await page.goto('/blog/building-rag-systems', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(2000);

    const emailInput = page.locator('input[aria-label="Email address"]').first();
    await emailInput.fill('test@example.com');

    const submitButton = page.locator('button[type="submit"]:has-text("Subscribe")').first();
    await submitButton.click();

    await expect(page.locator('text=Subscribed!').first()).toBeVisible({ timeout: 10000 });
  });

  test('empty email is prevented by browser validation', async ({ page }) => {
    await page.goto('/blog/building-rag-systems', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(2000);

    const emailInput = page.locator('input[aria-label="Email address"]').first();
    const isRequired = await emailInput.getAttribute('required');
    expect(isRequired).not.toBeNull();

    const inputType = await emailInput.getAttribute('type');
    expect(inputType).toBe('email');
  });

  test('invalid email is prevented by browser validation', async ({ page }) => {
    await page.goto('/blog/building-rag-systems', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(2000);

    const emailInput = page.locator('input[aria-label="Email address"]').first();
    const inputType = await emailInput.getAttribute('type');
    expect(inputType).toBe('email');
  });

  test('duplicate subscription shows error message', async ({ page }) => {
    await page.route('**/api/newsletter/subscribe', (route) => {
      return route.fulfill({
        status: 409,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'Already subscribed' }),
      });
    });

    await page.goto('/blog/building-rag-systems', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(2000);

    const emailInput = page.locator('input[aria-label="Email address"]').first();
    await emailInput.fill('existing@example.com');

    const submitButton = page.locator('button[type="submit"]:has-text("Subscribe")').first();
    await submitButton.click();

    await expect(page.locator('text=Already subscribed').first()).toBeVisible({ timeout: 10000 });
  });

  test('topic buttons can be toggled', async ({ page }) => {
    await page.goto('/blog/building-rag-systems', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(2000);

    const topicButton = page.locator('button[aria-pressed]').first();
    if (await topicButton.isVisible().catch(() => false)) {
      const initialState = await topicButton.getAttribute('aria-pressed');
      await topicButton.click();
      const newState = await topicButton.getAttribute('aria-pressed');
      expect(newState).not.toBe(initialState);
    }
  });
});
