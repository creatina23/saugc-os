import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: false,
  workers: 1,
  retries: 0,
  timeout: 30_000,
  reporter: [["list"], ["json", { outputFile: "test-results/playwright-results.json" }]],
  use: {
    browserName: "chromium",
    headless: true,
    serviceWorkers: "block",
    trace: "off",
    launchOptions: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH
      ? { executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH }
      : {},
  },
  webServer: {
    command: "node tests/e2e/servers.mjs",
    url: "http://127.0.0.1:3199/__ready",
    timeout: 45_000,
    reuseExistingServer: false,
  },
  projects: [
    { name: "sem-backend", testMatch: /(?:mobile|no-backend)\.spec\.ts$/, use: { baseURL: "http://127.0.0.1:3187" } },
    { name: "auth-sintetica", testMatch: /auth\.spec\.ts$/, use: { baseURL: "http://127.0.0.1:3188" } },
  ],
});
