import { test, expect } from '@playwright/test'

test.describe('Chat', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/chat', { waitUntil: 'networkidle' })
    // Wait for React hydration — greeting message is rendered by client state
    await expect(
      page.getByText("I'm an AI trained on everything Lorenzo has written")
    ).toBeVisible({ timeout: 15000 })
  })

  test('chat page loads', async ({ page }) => {
    await expect(page.locator('main').first()).toBeVisible()
  })

  test('chat input field is visible', async ({ page }) => {
    await expect(page.locator('textarea[aria-label="Message"]')).toBeVisible()
  })

  test('can type a message in the input', async ({ page }) => {
    const chatInput = page.locator('textarea[aria-label="Message"]')
    await chatInput.fill('Tell me about your projects')
    await expect(chatInput).toHaveValue('Tell me about your projects')
  })

  test('send button is visible', async ({ page }) => {
    await expect(page.locator('button[aria-label="Send message"]')).toBeVisible()
  })

  test('successful chat response appears', async ({ page }) => {
    await page.route('**/api/chat', (route) =>
      route.fulfill({
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
      })
    )

    const chatInput = page.locator('textarea[aria-label="Message"]')
    await chatInput.fill('What do you work on?')

    const sendButton = page.locator('button[aria-label="Send message"]')
    await sendButton.click()

    await expect(
      page.getByText('I work on AI and machine learning projects.')
    ).toBeVisible({ timeout: 15000 })
  })

  test('empty message is not sent', async ({ page }) => {
    let apiCalled = false
    await page.route('**/api/chat', (route) => {
      apiCalled = true
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          data: { answer: 'Response', provider: 'openai', model: 'gpt-4o-mini', degraded: false },
        }),
      })
    })

    const sendButton = page.locator('button[aria-label="Send message"]')
    await sendButton.click()

    await page.waitForTimeout(1000)
    expect(apiCalled).toBe(false)
  })

  test('error response shows fallback message', async ({ page }) => {
    await page.route('**/api/chat', (route) =>
      route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'Internal server error' }),
      })
    )

    const chatInput = page.locator('textarea[aria-label="Message"]')
    await chatInput.fill('Hello there')

    const sendButton = page.locator('button[aria-label="Send message"]')
    await sendButton.click()

    await expect(
      page.getByText('trouble responding', { exact: false })
    ).toBeVisible({ timeout: 15000 })
  })

  test('user message appears in chat', async ({ page }) => {
    await page.route('**/api/chat', async (route) => {
      await new Promise((resolve) => setTimeout(resolve, 1000))
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          data: { answer: 'Great question!', provider: 'openai', model: 'gpt-4o-mini', degraded: false },
        }),
      })
    })

    const chatInput = page.locator('textarea[aria-label="Message"]')
    await chatInput.fill('Tell me about RAG systems')

    const sendButton = page.locator('button[aria-label="Send message"]')
    await sendButton.click()

    await expect(
      page.getByText('Tell me about RAG systems')
    ).toBeVisible({ timeout: 15000 })
  })

  test('initial greeting message is shown', async ({ page }) => {
    const chatArea = page.locator('[aria-label="Conversation with Lorenzo"]')
    await expect(chatArea).toBeVisible()
    // At least the initial greeting bubble should exist
    const bubbles = chatArea.locator('[data-layout]')
    await expect(bubbles.first()).toBeVisible()
    const count = await bubbles.count()
    expect(count).toBeGreaterThan(0)
  })
})
