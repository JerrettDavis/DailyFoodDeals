import { expect, test } from "@playwright/test";
import { fillSubmitDealForm, signIn } from "./helpers";

test("signed-in users can favorite and vote on a deal", async ({ page }) => {
  await signIn(page, "user@example.com", "user1234");

  await page.goto("/deals?search=Pizza%20Monday%20Deal");
  await page.getByText("Pizza Monday Deal").click();
  await expect(page.getByRole("heading", { name: "Pizza Monday Deal" })).toBeVisible();

  await page.getByRole("button", { name: "🤍 Save" }).click();
  await expect(page.getByRole("button", { name: "❤️ Saved" })).toBeVisible();

  await page.getByRole("button", { name: "👍 0" }).click();
  await expect(page.getByRole("button", { name: "👍 1" })).toBeVisible();

  await page.goto("/favorites");
  await expect(page.getByText("Pizza Monday Deal")).toBeVisible();
});

test("non-admin users are redirected away from the admin dashboard", async ({ page }) => {
  await signIn(page, "user@example.com", "user1234");

  await page.goto("/admin");
  await expect(page).toHaveURL("/");
  await expect(page.getByRole("heading", { name: "Daily Food Deals" })).toBeVisible();
});

test("submit flow shows validation errors and success feedback", async ({ page }) => {
  const uniqueSuffix = Date.now();
  const dealTitle = `Playwright Deal ${uniqueSuffix}`;

  await signIn(page, "user@example.com", "user1234");
  await page.goto("/submit");

  await fillSubmitDealForm(page, {
    restaurantName: "Playwright Cafe",
    address: "123 Test Street",
    city: "Austin",
    state: "TX",
    zip: "78701",
    title: dealTitle,
    description: "Freshly submitted from Playwright.",
  });
  await page.getByRole("button", { name: "Submit Deal for Review" }).click();

  await expect(page.getByText("Select at least one available day.")).toBeVisible();

  await fillSubmitDealForm(page, {
    restaurantName: "Playwright Cafe",
    address: "123 Test Street",
    city: "Austin",
    state: "TX",
    zip: "78701",
    title: dealTitle,
    description: "Freshly submitted from Playwright.",
    dayValue: "1",
  });
  await page.getByRole("button", { name: "Submit Deal for Review" }).click();

  await expect(page).toHaveURL(/success=Deal%20submitted%20for%20review\./);
  await expect(page.getByText("Deal submitted for review.")).toBeVisible();
});
