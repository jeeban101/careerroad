import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
    testDir: './',
    testMatch: '**/*.spec.ts',
    fullyParallel: false, // Run tests sequentially to avoid conflicts
    forbidOnly: !!process.env.CI,
    retries: process.env.CI ? 2 : 0,
    workers: 1, // Single worker to avoid race conditions
    reporter: [
        ['html', { outputFolder: 'playwright-report' }],
        ['json', { outputFile: 'test-results/results.json' }],
        ['list']
    ],

    use: {
        baseURL: 'http://localhost:5173',
        trace: 'on-first-retry',
        screenshot: 'only-on-failure',
        video: 'retain-on-failure',
    },

    projects: [
        {
            name: 'chromium',
            use: { ...devices['Desktop Chrome'] },
        },
    ],

    // Run local dev server before starting tests
    webServer: [
        {
            command: 'cd .. && npx tsx server/index.ts',
            url: 'http://localhost:8005/api/roadmap-templates',
            reuseExistingServer: true,
            timeout: 120 * 1000,
        },
        {
            command: 'cd ../client && npm run start',
            url: 'http://localhost:5173',
            reuseExistingServer: true,
            timeout: 120 * 1000,
        },
    ],
});
