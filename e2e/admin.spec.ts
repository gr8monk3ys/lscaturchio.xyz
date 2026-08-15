import { test, expect } from "@playwright/test";

test("unauthenticated /admin lands on login, not the dashboard", async ({ page }) => {
  await page.goto("/admin");
  await expect(page).toHaveURL(/\/admin\/login/);
  await expect(page.locator("body")).not.toContainText("What are you publishing?");
});

test("admin pages are noindex", async ({ page }) => {
  await page.goto("/admin/login");
  const robots = page.locator('meta[name="robots"]');
  await expect(robots).toHaveAttribute("content", /noindex/);
});
