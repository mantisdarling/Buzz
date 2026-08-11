import { test, expect } from "@playwright/test";

test.describe("Buzz End-to-End User Flow", () => {
  test("landing page renders title and form controls", async ({ page }) => {
    await page.goto("/");

    // Verify brand header and tagline
    await expect(page.locator("header")).toContainText("Buzz");
    await expect(page.locator("main")).toContainText("TruthLens - AI Powered Misinformation and Fake News Detector");

    // Verify analyzer tab buttons
    await expect(page.getByRole("button", { name: /Paste Raw Text/i })).toBeVisible();
    await expect(page.getByRole("button", { name: /Article URL/i })).toBeVisible();
  });

  test("tab switching changes input field", async ({ page }) => {
    await page.goto("/");

    // Default tab is text
    await expect(page.getByPlaceholder(/Paste news article content/i)).toBeVisible();

    // Click URL tab
    await page.getByRole("button", { name: /Article URL/i }).click();

    // Input field switches to URL input
    await expect(page.getByPlaceholder(/https:\/\/example.com/i)).toBeVisible();
  });

  test("navigation to login page works", async ({ page }) => {
    await page.goto("/");

    // Click login link in header
    await page.getByRole("link", { name: /Login/i }).click();

    // Should navigate to /login page
    await expect(page).toHaveURL(/\/login/);
    await expect(page.getByRole("heading", { name: /Sign In to Buzz/i })).toBeVisible();
  });

  test("navigation to register page works", async ({ page }) => {
    await page.goto("/login");

    // Click Register link
    await page.getByRole("link", { name: /Register/i }).click();

    // Should navigate to /register page
    await expect(page).toHaveURL(/\/register/);
    await expect(page.getByRole("heading", { name: /Create Buzz Account/i })).toBeVisible();
  });
});
