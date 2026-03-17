import { expect, test } from "@playwright/test";

test("production routes and auth session endpoint stay healthy", async ({ page, request }) => {
  const sessionResponse = await request.get("/api/auth/session");
  expect(sessionResponse.status()).toBe(200);
  await expect(sessionResponse.json()).resolves.toBeNull();

  const dealsResponse = await page.goto("/deals");
  expect(dealsResponse?.ok()).toBeTruthy();
  await expect(page.getByRole("heading", { name: "Browse Deals" })).toBeVisible();
  await page.getByRole("button", { name: "Map" }).click();
  await expect(page.getByTestId("deals-map")).toBeVisible();
  const dealLink = page.getByRole("link", { name: /Pizza Monday Deal/i }).first();
  await expect(dealLink).toBeVisible();
  await dealLink.click();
  await expect(page).toHaveURL(/\/deals\/[^/?#]+$/);
  await expect(page.getByRole("heading", { name: "Pizza Monday Deal" })).toBeVisible();
  await expect(page.getByRole("link", { name: /Open in Maps/i })).toBeVisible();
});

test("all-location sample deals expose participation details without errors", async ({ page }) => {
  const dealsResponse = await page.goto("/deals?search=Whataburger");
  expect(dealsResponse?.ok()).toBeTruthy();

  const dealLink = page.getByRole("link", { name: /Whataburger App Free Fries/i }).first();
  await expect(dealLink).toBeVisible();
  await dealLink.click();

  await expect(page.getByRole("heading", { name: "Whataburger App Free Fries" })).toBeVisible();
  await expect(page.getByText("All Locations")).toBeVisible();
  await expect(page.locator("span").filter({ hasText: /^Sample Data$/ }).first()).toBeVisible();
  await expect(page.getByRole("heading", { name: "Participating locations" })).toBeVisible();
  await expect(page.getByText("Whataburger - Downtown").first()).toBeVisible();
});
