import { test, expect } from '@playwright/test'

// The newsletter signup is paused (src/lib/newsletter-signup.ts): it is off
// unless NEWSLETTER_SIGNUP_ENABLED is "true", and CI builds without it, so
// this checks the default a reader gets. The form's own behaviour is covered
// by src/__tests__/components/newsletter-form.test.tsx, and the route's
// refusal by src/__tests__/api/newsletter-subscribe.test.ts.
test.describe('Newsletter signup (paused)', () => {
  test('an essay page has no signup form', async ({ page }) => {
    await page.goto('/blog/building-rag-systems', { waitUntil: 'networkidle' })

    // The essay itself rendered, so an absent form is not a failed page.
    await expect(page.locator('h1').first()).toBeVisible({ timeout: 15000 })
    await expect(page.locator('input[aria-label="Email address"]')).toHaveCount(0)
    await expect(page.getByRole('button', { name: 'Subscribe' })).toHaveCount(0)
  })
})
