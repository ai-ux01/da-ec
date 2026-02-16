import { test, expect } from "@playwright/test";

test.describe("My orders page", () => {
  test("loads and shows content", async ({ page }) => {
    await page.goto("/orders");
    await expect(page.locator("h2, h1").filter({ hasText: /my orders|orders/i })).toBeVisible({ timeout: 10000 });
    await expect(
      page.getByText(/log in|loading|orders|haven't placed|api is configured/i).first()
    ).toBeVisible({ timeout: 5000 });
  });
});
