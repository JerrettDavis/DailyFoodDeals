import { defineConfig } from "@playwright/test";

const port = 3000;
const baseURL = `http://127.0.0.1:${port}`;
const databaseUrl = process.env.DATABASE_URL ?? "file:./prisma/e2e.db";

export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: false,
  workers: 1,
  retries: process.env.CI ? 2 : 0,
  timeout: 60_000,
  expect: {
    timeout: 10_000,
  },
  reporter: process.env.CI
    ? [["github"], ["html", { open: "never" }]]
    : [["list"], ["html", { open: "never" }]],
  use: {
    baseURL,
    browserName: "chromium",
    trace: "on-first-retry",
    screenshot: "only-on-failure",
  },
  webServer: {
    command: "npx prisma db push --force-reset && npx prisma generate && npm run seed && npm run dev",
    url: baseURL,
    timeout: 120_000,
    reuseExistingServer: !process.env.CI,
    env: {
      ...process.env,
      DATABASE_URL: databaseUrl,
      AUTH_SECRET: "playwright-auth-secret",
      NEXTAUTH_SECRET: "playwright-auth-secret",
      AUTH_URL: baseURL,
      NEXTAUTH_URL: baseURL,
    },
  },
});
