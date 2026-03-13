import { test, expect } from '@playwright/test';

test.describe('Chat', () => {
  test('chat page loads', async ({ page }) => {
    await page.goto('/chat', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(2000);

    await expect(page.locator('main').first()).toBeVisible();
  });

  test('chat input field is visible', async ({ page }) => {
    await page.goto('/chat', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(2000);

    const chatInput = page.locator('textarea[aria-label="Message"]');
    await expect(chatInput).toBeVisible({ timeout: 10000 });
  });

  test('can type a message in the input', async ({ page }) => {
    await page.goto('/chat', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(2000);

    const chatInput = page.locator('textarea[aria-label="Message"]');
    await chatInput.fill('Tell me about your projects');
    await expect(chatInput).toHaveValue('Tell me about your projects');
  });

  test('send button is visible', async ({ page }) => {
    await page.goto('/chat', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(2000);

    const sendButton = page.locator('button[aria-label="Send message"]');
    await expect(sendButton).toBeVisible({ timeout: 10000 });
  });

  test('successful chat response appears', async ({ page }) => {
    await page.route('**/api/chat', (route) => {
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          data: {
            answer: 'I work on AI and machine learning projects.',
            provider: 'openai',
            model: 'gpt-4o-mini',
            degraded: false,
          },
        }),
      });
    });

    await page.goto('/chat', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(2000);

    const chatInput = page.locator('textarea[aria-label="Message"]');
    await chatInput.fill('What do you work on?');

    const sendButton = page.locator('button[aria-label="Send message"]');
    await sendButton.click();

    await expect(
      page.locator('text=I work on AI and machine learning projects.')
    ).toBeVisible({ timeout: 10000 });
  });

  test('empty message is not sent', async ({ page }) => {
    let apiCalled = false;
    await page.route('**/api/chat', (route) => {
      apiCalled = true;
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          data: { answer: 'Response', provider: 'openai', model: 'gpt-4o-mini', degraded: false },
        }),
      });
    });

    await page.goto('/chat', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(2000);

    const sendButton = page.locator('button[aria-label="Send message"]');
    await sendButton.click();

    await page.waitForTimeout(1000);
    expect(apiCalled).toBe(false);
  });

  test('error response shows fallback message', async ({ page }) => {
    await page.route('**/api/chat', (route) => {
      return route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'Internal server error' }),
      });
    });

    await page.goto('/chat', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(2000);

    const chatInput = page.locator('textarea[aria-label="Message"]');
    await chatInput.fill('Hello there');

    const sendButton = page.locator('button[aria-label="Send message"]');
    await sendButton.click();

    await expect(
      page.locator('text=trouble responding')
    ).toBeVisible({ timeout: 10000 });
  });

  test('user message appears in chat', async ({ page }) => {
    await page.route('**/api/chat', async (route) => {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          data: { answer: 'Great question!', provider: 'openai', model: 'gpt-4o-mini', degraded: false },
        }),
      });
    });

    await page.goto('/chat', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(2000);

    const chatInput = page.locator('textarea[aria-label="Message"]');
    await chatInput.fill('Tell me about RAG systems');

    const sendButton = page.locator('button[aria-label="Send message"]');
    await sendButton.click();

    await expect(
      page.locator('text=Tell me about RAG systems')
    ).toBeVisible({ timeout: 10000 });
  });

  test('initial greeting message is shown', async ({ page }) => {
    await page.goto('/chat', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(2000);

    const chatArea = page.locator('[aria-label="Conversation with Lorenzo"]');
    await expect(chatArea).toBeVisible({ timeout: 10000 });

    const messages = chatArea.locator('[class*="ChatBubble"], [data-variant]');
    const count = await messages.count();
    expect(count).toBeGreaterThan(0);
  });
});
