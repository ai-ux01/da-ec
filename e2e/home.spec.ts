import { test, expect } from "@playwright/test";

test.describe("Home page", () => {
  test("loads and shows hero", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("h1")).toBeVisible();
    await expect(page.getByRole("link", { name: /shop|buy|buy now/i })).toBeVisible();
  });

  test("navigation to Buy works", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("link", { name: /buy now/i }).first().click();
    await expect(page).toHaveURL(/\/buy/);
    await expect(page.locator("h2, h1").filter({ hasText: /buy|shop/i })).toBeVisible();
  });
});
