import { expect, test } from "@playwright/test";

test("browse and filter deals from home and deals listing", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("link", { name: "Happy Hour", exact: true }).click();

  await expect(page).toHaveURL(/category=Happy%20Hour/);
  await expect(page.getByText("Happy Hour Wings")).toBeVisible();
  await expect(page.getByText("Taco Tuesday Specials")).not.toBeVisible();

  await page.goto("/deals");
  await expect(page.getByText("Monday Burger Night")).toBeVisible();

  await page.getByPlaceholder("Search deals, restaurants...").fill("Joe's");
  await expect(page.getByText("Monday Burger Night")).toBeVisible();
  await expect(page.getByText("Happy Hour Wings")).toBeVisible();
  await expect(page.getByText("Weekend Brunch Special")).not.toBeVisible();
});

test("invalid day filter is ignored and guest save redirects to sign in", async ({ page }) => {
  await page.goto("/deals?day=");
  await expect(page.getByText("Pizza Monday Deal")).toBeVisible();

  await page.goto("/deals?day=foo");
  await expect(page.getByText("Pizza Monday Deal")).toBeVisible();

  await page.getByText("Pizza Monday Deal").click();
  await expect(page.getByRole("heading", { name: "Pizza Monday Deal" })).toBeVisible();

  await page.getByRole("button", { name: "🤍 Save" }).click();
  await expect(page).toHaveURL(/\/auth\/signin/);
});
