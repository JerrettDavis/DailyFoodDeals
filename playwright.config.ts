import { defineConfig } from "@playwright/test";

const port = 3100;
const baseURL = `http://127.0.0.1:${port}`;
const databaseUrl = process.env.E2E_DATABASE_URL ?? "file:./prisma/e2e.db";
const authSecret = process.env.AUTH_SECRET ?? process.env.NEXTAUTH_SECRET ?? "playwright-auth-secret";

function isSafeTestDatabase(url: string) {
  if (url.startsWith("file:")) {
    return /(?:^|[\\/])[^\\/]*(e2e|test)[^\\/]*\.db(?:\?|$)/i.test(url);
  }

  const parsedUrl = new URL(url);
  const databaseName = parsedUrl.pathname.replace(/^\//, "");
  const isLocalHost = ["localhost", "127.0.0.1"].includes(parsedUrl.hostname);
  const isTestDatabase = /(?:^|[_-])(e2e|test)(?:[_-]|$)/i.test(databaseName);

  return isLocalHost && isTestDatabase;
}

if (!isSafeTestDatabase(databaseUrl)) {
  throw new Error(`Refusing to run Playwright against a non-test database: ${databaseUrl}`);
}

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
    command: `npx prisma db push --force-reset && npx prisma generate && npm run seed && npm run build && npm run start -- --hostname 127.0.0.1 --port ${port}`,
    url: baseURL,
    timeout: 180_000,
    reuseExistingServer: false,
    env: {
      ...process.env,
      PORT: String(port),
      DATABASE_URL: databaseUrl,
      AUTH_SECRET: authSecret,
      NEXTAUTH_SECRET: authSecret,
      AUTH_URL: baseURL,
      NEXTAUTH_URL: baseURL,
      AUTH_TRUST_HOST: "true",
    },
  },
});
