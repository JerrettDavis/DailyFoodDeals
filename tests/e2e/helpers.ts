import { expect, type Page } from "@playwright/test";

export async function signIn(page: Page, email: string, password: string) {
  await page.goto("/auth/signin");
  await page.getByPlaceholder("you@example.com").fill(email);
  await page.getByPlaceholder("••••••••").fill(password);
  await page.getByRole("button", { name: "Sign In" }).click();
  await expect(page.getByRole("button", { name: "Sign Out" })).toBeVisible();
}

export async function signOut(page: Page) {
  await page.getByRole("button", { name: "Sign Out" }).click();
  await expect(page.getByRole("link", { name: "Sign In" })).toBeVisible();
}

interface SubmitDealFields {
  restaurantName: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  title: string;
  description: string;
  dayValue?: string;
}

export async function fillSubmitDealForm(page: Page, fields: SubmitDealFields) {
  await page.getByPlaceholder("e.g., Joe's Burger Shack").fill(fields.restaurantName);
  await page.getByPlaceholder("123 Main St").fill(fields.address);
  await page.locator('input[name="restaurantCity"]').fill(fields.city);
  await page.locator('input[name="restaurantState"]').fill(fields.state);
  await page.locator('input[name="restaurantZip"]').fill(fields.zip);
  await page.getByPlaceholder("e.g., Happy Hour 50% Off Appetizers").fill(fields.title);
  await page.getByPlaceholder("Describe the deal in detail...").fill(fields.description);

  if (fields.dayValue) {
    await page.locator(`input[name="days"][value="${fields.dayValue}"]`).check();
  }
}
