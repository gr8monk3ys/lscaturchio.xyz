import { test, expect } from '@playwright/test'

test.describe('Newsletter Subscription', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/blog/building-rag-systems', { waitUntil: 'networkidle' })
    // Wait for newsletter form to hydrate
    const emailInput = page.locator('input[aria-label="Email address"]').first()
    await expect(emailInput).toBeVisible({ timeout: 15000 })
  })

  test('newsletter form is visible on a blog post', async ({ page }) => {
    await expect(page.locator('input[aria-label="Email address"]').first()).toBeVisible()
  })

  test('can fill in email field', async ({ page }) => {
    const emailInput = page.locator('input[aria-label="Email address"]').first()
    await emailInput.fill('test@example.com')
    await expect(emailInput).toHaveValue('test@example.com')
  })

  test('successful subscription shows success message', async ({ page }) => {
    await page.route('**/api/newsletter/subscribe', (route) =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ message: 'Successfully subscribed!' }),
      })
    )

    const emailInput = page.locator('input[aria-label="Email address"]').first()
    await emailInput.fill('test@example.com')

    const submitButton = page.locator('button[type="submit"]').filter({ hasText: 'Subscribe' }).first()
    await submitButton.click()

    // Button changes to "Subscribed!" and message div shows success text
    await expect(page.getByText('Subscribed!').first()).toBeVisible({ timeout: 15000 })
  })

  test('empty email is prevented by browser validation', async ({ page }) => {
    const emailInput = page.locator('input[aria-label="Email address"]').first()
    expect(await emailInput.getAttribute('required')).not.toBeNull()
    expect(await emailInput.getAttribute('type')).toBe('email')
  })

  test('invalid email is prevented by browser validation', async ({ page }) => {
    const emailInput = page.locator('input[aria-label="Email address"]').first()
    expect(await emailInput.getAttribute('type')).toBe('email')
  })

  test('duplicate subscription shows error message', async ({ page }) => {
    await page.route('**/api/newsletter/subscribe', (route) =>
      route.fulfill({
        status: 409,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'Already subscribed' }),
      })
    )

    const emailInput = page.locator('input[aria-label="Email address"]').first()
    await emailInput.fill('existing@example.com')

    const submitButton = page.locator('button[type="submit"]').filter({ hasText: 'Subscribe' }).first()
    await submitButton.click()

    await expect(page.getByText('Already subscribed').first()).toBeVisible({ timeout: 15000 })
  })

  test('topic buttons can be toggled', async ({ page }) => {
    // Find a topic button that has aria-pressed attribute
    const topicButton = page.locator('button[aria-pressed]').first()
    await expect(topicButton).toBeVisible({ timeout: 10000 })

    const initialState = await topicButton.getAttribute('aria-pressed')
    await topicButton.click()

    // After click, the state should have toggled
    const expectedState = initialState === 'true' ? 'false' : 'true'
    await expect(topicButton).toHaveAttribute('aria-pressed', expectedState, { timeout: 5000 })
  })
})
