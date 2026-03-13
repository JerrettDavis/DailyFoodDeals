import { expect, test } from "@playwright/test";
import { signIn } from "./helpers";

test("invalid sign in and protected route redirects work", async ({ page }) => {
  await page.goto("/favorites");
  await expect(page).toHaveURL(/\/auth\/signin/);

  await page.getByPlaceholder("you@example.com").fill("user@example.com");
  await page.getByPlaceholder("••••••••").fill("wrong-password");
  await page.getByRole("button", { name: "Sign In" }).click();

  await expect(page.getByText("Invalid email or password")).toBeVisible();
});

test("signup validates password strength and supports normalized email sign in", async ({ page }) => {
  const uniqueEmail = `MixedCase.User+${Date.now()}@Example.com`;
  const normalizedEmail = uniqueEmail.toLowerCase();
  const password = "Pass1234";

  await page.goto("/auth/signup");
  await page.getByPlaceholder("Your Name").fill("Playwright User");
  await page.getByPlaceholder("you@example.com").fill(uniqueEmail);
  await page.getByPlaceholder("At least 8 characters").fill("password");
  await page.getByRole("button", { name: "Create Account" }).click();

  await expect(page.getByText("Password must be at least 8 characters and include letters and numbers.")).toBeVisible();

  await page.getByPlaceholder("Your Name").fill("Playwright User");
  await page.getByPlaceholder("you@example.com").fill(uniqueEmail);
  await page.getByPlaceholder("At least 8 characters").fill(password);
  await page.getByRole("button", { name: "Create Account" }).click();

  await expect(page).toHaveURL(/\/auth\/signin\?registered=true$/);
  await expect(page.getByText("Account created! Sign in below.")).toBeVisible();

  await signIn(page, normalizedEmail, password);
  await expect(page).toHaveURL("/");
});
