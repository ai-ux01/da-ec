import { test, expect } from "@playwright/test";

test.describe("Buy page", () => {
  test("loads and shows products or empty state", async ({ page }) => {
    await page.goto("/buy");
    await expect(page.locator("h2, h1").filter({ hasText: /buy|shop/i })).toBeVisible();
    const productsOrEmpty = page.getByText(/loading|no products|add to cart|out of stock/i);
    await expect(productsOrEmpty.first()).toBeVisible({ timeout: 10000 });
  });

  test("checkout panel can open from cart", async ({ page }) => {
    await page.goto("/buy");
    await page.waitForLoadState("networkidle");
    const addToCart = page.getByRole("button", { name: /add to cart/i }).first();
    if (await addToCart.isVisible()) {
      await addToCart.click();
      const cartButton = page.getByRole("button", { name: /cart/i }).first();
      await cartButton.click();
      await expect(page.getByText(/cart|checkout|your cart/i).first()).toBeVisible({ timeout: 5000 });
    } else {
      const cartButton = page.getByRole("button", { name: /cart/i }).first();
      await cartButton.click();
      await expect(page.getByText(/cart|checkout|empty/i).first()).toBeVisible({ timeout: 5000 });
    }
  });
});
