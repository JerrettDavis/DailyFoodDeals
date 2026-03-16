import { expect, test } from "@playwright/test";

test("production routes and auth session endpoint stay healthy", async ({ page, request }) => {
  const sessionResponse = await request.get("/api/auth/session");
  expect(sessionResponse.status()).toBe(200);
  await expect(sessionResponse.json()).resolves.toBeNull();

  const dealsResponse = await page.goto("/deals");
  expect(dealsResponse?.ok()).toBeTruthy();
  await expect(page.getByRole("heading", { name: "Browse Deals" })).toBeVisible();
  const dealLink = page.getByRole("link", { name: /Pizza Monday Deal/i }).first();
  await expect(dealLink).toBeVisible();
  await dealLink.click();
  await expect(page).toHaveURL(/\/deals\/[^/?#]+$/);
  await expect(page.getByRole("heading", { name: "Pizza Monday Deal" })).toBeVisible();
});
