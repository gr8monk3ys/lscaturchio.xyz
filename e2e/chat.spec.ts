import { test, expect } from '@playwright/test'

test.describe('Chat', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/chat', { waitUntil: 'networkidle' })
    // Wait for React hydration — greeting message is rendered by client state
    await expect(
      page.getByText("I answer from Lorenzo's essays and the notes on this site")
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
      page.getByText("didn't get through", { exact: false })
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

/**
 * The ask drawer's discard control, verified in a browser.
 *
 * This is e2e rather than a unit test for two reasons. The first is evidence:
 * reaching a non-empty transcript means actually sending a question, and the
 * response has to come back through the real component. The second is the
 * coverage ratchet — a unit test on this file makes v8 start counting a
 * 290-line component that nothing else imports, and global coverage drops
 * below the threshold even though the codebase is better tested. `/api/chat`
 * is intercepted by Playwright and never leaves the browser, which is the
 * pattern the tests above already use.
 */
test.describe('the ask drawer discards once it is asked twice', () => {
  test('arms on the first click and discards on the second', async ({ page }) => {
    // Browsing must not touch the production view counter.
    await page.route('**/api/views', (route) => route.abort())
    await page.route('**/api/chat', (route) =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ data: { answer: 'Boredom is where the thinking starts.' } }),
      })
    )

    await page.goto('/', { waitUntil: 'networkidle' })
    await page.getByLabel('Ask the site').first().click()

    const drawer = page.locator('#ask-drawer')
    await expect(drawer).toBeVisible()

    await drawer.getByLabel('Ask a question').fill('Why does boredom matter?')
    await drawer.getByLabel('Send question').click()

    const answer = drawer.getByText('Boredom is where the thinking starts.')
    await expect(answer).toBeVisible({ timeout: 15000 })

    // Before: this control and "Close the ask panel" were the same 36px
    // icon-only square 4px apart, destructive one first, and one click threw
    // the transcript away.
    const discard = drawer.getByLabel('Start a new conversation')
    await expect(discard).toBeEnabled()
    await discard.click()

    // Armed, not fired.
    await expect(drawer.getByLabel('Confirm discarding this conversation')).toBeVisible()
    await expect(answer).toBeVisible()

    await drawer.getByLabel('Confirm discarding this conversation').click()
    await expect(answer).toHaveCount(0)
  })

  test('cannot discard a conversation that has not started', async ({ page }) => {
    await page.route('**/api/views', (route) => route.abort())
    await page.goto('/', { waitUntil: 'networkidle' })
    await page.getByLabel('Ask the site').first().click()

    const drawer = page.locator('#ask-drawer')
    await expect(drawer).toBeVisible()
    // Which is why this is a confirm and not an undo: the only time it can
    // fire is the only time it costs something.
    await expect(drawer.getByLabel('Start a new conversation')).toBeDisabled()
  })
})
