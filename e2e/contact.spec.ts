import { test, expect } from '@playwright/test';

test.describe('Contact Form', () => {
  test('contact page loads with form fields', async ({ page }) => {
    await page.goto('/contact', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(2000);

    await expect(page.locator('#name')).toBeVisible();
    await expect(page.locator('#email')).toBeVisible();
    await expect(page.locator('#subject')).toBeVisible();
    await expect(page.locator('#message')).toBeVisible();
  });

  test('can fill in all form fields', async ({ page }) => {
    await page.goto('/contact', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(2000);

    await page.locator('#name').fill('Jane Doe');
    await page.locator('#email').fill('jane@example.com');
    await page.locator('#subject').fill('Project inquiry');
    await page.locator('#message').fill('I would like to discuss a potential collaboration.');

    await expect(page.locator('#name')).toHaveValue('Jane Doe');
    await expect(page.locator('#email')).toHaveValue('jane@example.com');
    await expect(page.locator('#subject')).toHaveValue('Project inquiry');
    await expect(page.locator('#message')).toHaveValue('I would like to discuss a potential collaboration.');
  });

  test('successful submission shows success message', async ({ page }) => {
    await page.route('**/api/contact', (route) => {
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ success: true }),
      });
    });

    await page.goto('/contact', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(2000);

    await page.locator('#name').fill('Jane Doe');
    await page.locator('#email').fill('jane@example.com');
    await page.locator('#subject').fill('Project inquiry');
    await page.locator('#message').fill('I would like to discuss a potential collaboration.');

    const submitButton = page.locator('button[type="submit"]').first();
    await submitButton.click();

    const successMessage = page.locator('[aria-live="polite"]').locator('text=sent');
    await expect(successMessage).toBeVisible({ timeout: 10000 });
  });

  test('required fields have required attribute', async ({ page }) => {
    await page.goto('/contact', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(2000);

    const nameRequired = await page.locator('#name').getAttribute('required');
    const emailRequired = await page.locator('#email').getAttribute('required');
    const subjectRequired = await page.locator('#subject').getAttribute('required');
    const messageRequired = await page.locator('#message').getAttribute('required');

    expect(nameRequired).not.toBeNull();
    expect(emailRequired).not.toBeNull();
    expect(subjectRequired).not.toBeNull();
    expect(messageRequired).not.toBeNull();
  });

  test('server error shows error message', async ({ page }) => {
    await page.route('**/api/contact', (route) => {
      return route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'Internal server error' }),
      });
    });

    await page.goto('/contact', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(2000);

    await page.locator('#name').fill('Jane Doe');
    await page.locator('#email').fill('jane@example.com');
    await page.locator('#subject').fill('Project inquiry');
    await page.locator('#message').fill('Test message content.');

    const submitButton = page.locator('button[type="submit"]').first();
    await submitButton.click();

    const errorMessage = page.locator('[aria-live="polite"]').locator('text=failed');
    await expect(errorMessage).toBeVisible({ timeout: 10000 });
  });

  test('submit button shows loading state', async ({ page }) => {
    await page.route('**/api/contact', async (route) => {
      await new Promise((resolve) => setTimeout(resolve, 2000));
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ success: true }),
      });
    });

    await page.goto('/contact', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(2000);

    await page.locator('#name').fill('Jane Doe');
    await page.locator('#email').fill('jane@example.com');
    await page.locator('#subject').fill('Project inquiry');
    await page.locator('#message').fill('Test message content.');

    const submitButton = page.locator('button[type="submit"]').first();
    await submitButton.click();

    await expect(submitButton).toContainText('Sending');
  });
});
