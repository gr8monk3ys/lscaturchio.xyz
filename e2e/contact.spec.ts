import { test, expect } from '@playwright/test'

test.describe('Contact Form', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/contact', { waitUntil: 'networkidle' })
    // Wait for form hydration
    await expect(page.locator('#name')).toBeVisible({ timeout: 15000 })
  })

  test('contact page loads with form fields', async ({ page }) => {
    await expect(page.locator('#name')).toBeVisible()
    await expect(page.locator('#email')).toBeVisible()
    await expect(page.locator('#subject')).toBeVisible()
    await expect(page.locator('#message')).toBeVisible()
  })

  test('can fill in all form fields', async ({ page }) => {
    await page.locator('#name').fill('Jane Doe')
    await page.locator('#email').fill('jane@example.com')
    await page.locator('#subject').fill('Project inquiry')
    await page.locator('#message').fill('I would like to discuss a potential collaboration.')

    await expect(page.locator('#name')).toHaveValue('Jane Doe')
    await expect(page.locator('#email')).toHaveValue('jane@example.com')
    await expect(page.locator('#subject')).toHaveValue('Project inquiry')
    await expect(page.locator('#message')).toHaveValue('I would like to discuss a potential collaboration.')
  })

  test('successful submission shows success message', async ({ page }) => {
    await page.route('**/api/contact', (route) =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ success: true }),
      })
    )

    await page.locator('#name').fill('Jane Doe')
    await page.locator('#email').fill('jane@example.com')
    await page.locator('#subject').fill('Project inquiry')
    await page.locator('#message').fill('I would like to discuss a potential collaboration.')

    await page.locator('button[type="submit"]').first().click()

    await expect(page.locator('[aria-live="polite"]')).toContainText('Message sent', {
      timeout: 15000,
    })
  })

  test('required fields have required attribute', async ({ page }) => {
    expect(await page.locator('#name').getAttribute('required')).not.toBeNull()
    expect(await page.locator('#email').getAttribute('required')).not.toBeNull()
    expect(await page.locator('#subject').getAttribute('required')).not.toBeNull()
    expect(await page.locator('#message').getAttribute('required')).not.toBeNull()
  })

  test('server error shows error message', async ({ page }) => {
    await page.route('**/api/contact', (route) =>
      route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'Internal server error' }),
      })
    )

    await page.locator('#name').fill('Jane Doe')
    await page.locator('#email').fill('jane@example.com')
    await page.locator('#subject').fill('Project inquiry')
    await page.locator('#message').fill('Test message content.')

    await page.locator('button[type="submit"]').first().click()

    await expect(page.locator('[aria-live="polite"]')).toContainText('Message failed to send', {
      timeout: 15000,
    })
  })

  test('submit button shows loading state', async ({ page }) => {
    await page.route('**/api/contact', async (route) => {
      await new Promise((resolve) => setTimeout(resolve, 3000))
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ success: true }),
      })
    })

    await page.locator('#name').fill('Jane Doe')
    await page.locator('#email').fill('jane@example.com')
    await page.locator('#subject').fill('Project inquiry')
    await page.locator('#message').fill('Test message content.')

    const submitButton = page.locator('button[type="submit"]').first()
    await submitButton.click()

    await expect(submitButton).toContainText('Sending', { timeout: 5000 })
  })
})
