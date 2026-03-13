import { expect, test } from "@playwright/test";
import { fillSubmitDealForm, signIn } from "./helpers";

test("admin can approve a newly submitted pending deal and it becomes publicly visible", async ({ page }) => {
  const uniqueSuffix = Date.now();
  const dealTitle = `Approval Flow Deal ${uniqueSuffix}`;

  await signIn(page, "user@example.com", "user1234");
  await page.goto("/submit");

  await fillSubmitDealForm(page, {
    restaurantName: "Approval Test Cafe",
    address: "456 Approval Ave",
    city: "Austin",
    state: "TX",
    zip: "78702",
    title: dealTitle,
    description: "A deal submitted to test the admin approval flow.",
    dayValue: "2",
  });
  await page.getByRole("button", { name: "Submit Deal for Review" }).click();

  await expect(page.getByText("Deal submitted for review.")).toBeVisible();

  await page.getByRole("button", { name: "Sign Out" }).click();
  await expect(page.getByRole("link", { name: "Sign In" })).toBeVisible();

  await signIn(page, "admin@dailyfooddeals.com", "admin123");
  await page.goto("/admin");
  await expect(page.getByRole("heading", { name: "Admin Dashboard" })).toBeVisible();

  const pendingCard = page
    .locator("div.bg-gray-900.border.border-gray-800.rounded-xl")
    .filter({ hasText: dealTitle })
    .filter({ has: page.getByRole("button", { name: "✓ Approve" }) });
  await expect(pendingCard).toBeVisible();
  await pendingCard.getByRole("button", { name: "✓ Approve" }).click();

  await page.goto(`/deals?search=${encodeURIComponent(dealTitle)}`);
  await expect(page.getByText(dealTitle)).toBeVisible();
});

test("admin can verify an unverified approved deal", async ({ page }) => {
  await signIn(page, "admin@dailyfooddeals.com", "admin123");
  await page.goto("/admin");
  await expect(page.getByRole("heading", { name: "Admin Dashboard" })).toBeVisible();

  const verifyRow = page
    .locator("div.bg-gray-900.border.border-gray-800.rounded-xl")
    .filter({ hasText: "Pizza Monday Deal" })
    .filter({ has: page.getByRole("button", { name: "✓ Verify" }) });
  await expect(verifyRow).toBeVisible();
  await verifyRow.getByRole("button", { name: "✓ Verify" }).click();
  await expect(verifyRow).not.toBeVisible();

  await page.goto("/deals?search=Pizza%20Monday%20Deal");
  await page.getByText("Pizza Monday Deal").click();
  await expect(page.getByText("✓ Verified Deal")).toBeVisible();
});
