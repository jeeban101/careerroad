import { defineConfig } from "@playwright/test";

/**
 * Minimal Playwright config for running API-only integration tests.
 * Skips webServer startup — assumes servers are already running.
 */
export default defineConfig({
  testDir: "./",
  testMatch: "**/*.spec.ts",
  fullyParallel: false,
  retries: 0,
  workers: 1,
  reporter: [["list"]],
  use: {
    baseURL: "http://localhost:8005",
  },
});
