import { test, expect, Page } from '@playwright/test';

const CLIENT_URL = 'http://localhost:5173';

// Test user credentials
const testUser = {
    email: `e2e_test_${Date.now()}@example.com`,
    password: 'TestPassword123!',
    firstName: 'E2E',
    lastName: 'Tester'
};

test.describe('CareerRoad E2E User Journeys', () => {

    test.describe('Journey 1: New User Registration & First Roadmap', () => {

        test('complete new user flow', async ({ page }) => {
            // Step 1: Navigate to application
            await page.goto(CLIENT_URL);
            await expect(page).toHaveTitle(/CareerRoad/i);

            // Step 2: Click Sign Up
            await page.click('text=Sign Up');
            await expect(page).toHaveURL(/.*signup/);

            // Step 3: Fill registration form
            await page.fill('input[name="email"]', testUser.email);
            await page.fill('input[name="password"]', testUser.password);
            await page.fill('input[name="firstName"]', testUser.firstName);
            await page.fill('input[name="lastName"]', testUser.lastName);

            // Step 4: Submit registration
            await page.click('button[type="submit"]');

            // Step 5: Verify redirect to dashboard
            await page.waitForURL(/.*dashboard/, { timeout: 10000 });
            await expect(page.locator('text=' + testUser.firstName)).toBeVisible();

            // Step 6: Generate first roadmap
            await page.click('text=Generate Roadmap');
            await page.fill('input[placeholder*="current"]', 'Computer Science');
            await page.fill('input[placeholder*="target"]', 'Full Stack Developer');
            await page.click('button:has-text("Generate")');

            // Step 7: Wait for AI generation
            await page.waitForSelector('text=Phase', { timeout: 30000 });

            // Step 8: Save roadmap
            await page.click('button:has-text("Save")');
            await page.waitForSelector('text=Saved successfully', { timeout: 5000 });

            // Step 9: Navigate to saved roadmaps
            await page.click('text=My Roadmaps');
            await expect(page.locator('text=Computer Science')).toBeVisible();
        });
    });

    test.describe('Journey 2: Roadmap to Kanban Flow', () => {

        test.beforeEach(async ({ page }) => {
            // Login first
            await page.goto(`${CLIENT_URL}/login`);
            await page.fill('input[name="email"]', testUser.email);
            await page.fill('input[name="password"]', testUser.password);
            await page.click('button[type="submit"]');
            await page.waitForURL(/.*dashboard/);
        });

        test('convert roadmap to kanban board', async ({ page }) => {
            // Step 1: Go to roadmap history
            await page.click('text=History');
            await expect(page.locator('.roadmap-item').first()).toBeVisible();

            // Step 2: Click on a roadmap
            await page.locator('.roadmap-item').first().click();

            // Step 3: Generate Kanban board
            await page.click('button:has-text("Create Kanban")');
            await page.waitForSelector('text=Board created', { timeout: 30000 });

            // Step 4: Navigate to Kanban boards
            await page.click('text=Kanban');
            await expect(page.locator('.kanban-board').first()).toBeVisible();

            // Step 5: Open board
            await page.locator('.kanban-board').first().click();

            // Step 6: Verify tasks are present
            await expect(page.locator('.kanban-task')).toHaveCount({ min: 1 });

            // Step 7: Move a task to "In Progress"
            const firstTask = page.locator('.kanban-task').first();
            await firstTask.dragTo(page.locator('[data-column="in-progress"]'));

            // Step 8: Verify task moved
            await expect(page.locator('[data-column="in-progress"] .kanban-task')).toHaveCount({ min: 1 });
        });
    });

    test.describe('Journey 3: Progress Tracking', () => {

        test.beforeEach(async ({ page }) => {
            await page.goto(`${CLIENT_URL}/login`);
            await page.fill('input[name="email"]', testUser.email);
            await page.fill('input[name="password"]', testUser.password);
            await page.click('button[type="submit"]');
            await page.waitForURL(/.*dashboard/);
        });

        test('track task completion', async ({ page }) => {
            // Step 1: Go to a roadmap
            await page.click('text=My Roadmaps');
            await page.locator('.roadmap-item').first().click();

            // Step 2: Find a task checkbox
            const taskCheckbox = page.locator('input[type="checkbox"]').first();

            // Step 3: Mark task as complete
            await taskCheckbox.check();

            // Step 4: Verify progress updated
            await page.waitForSelector('text=Progress saved', { timeout: 5000 });

            // Step 5: Go to dashboard
            await page.click('text=Dashboard');

            // Step 6: Verify stats updated
            await expect(page.locator('text=Completed Tasks')).toBeVisible();
            const statsValue = await page.locator('[data-stat="completed"]').textContent();
            expect(parseInt(statsValue || '0')).toBeGreaterThan(0);
        });
    });

    test.describe('Journey 4: Resume Analysis (if available)', () => {

        test.beforeEach(async ({ page }) => {
            await page.goto(`${CLIENT_URL}/login`);
            await page.fill('input[name="email"]', testUser.email);
            await page.fill('input[name="password"]', testUser.password);
            await page.click('button[type="submit"]');
            await page.waitForURL(/.*dashboard/);
        });

        test('upload and analyze resume', async ({ page }) => {
            // Skip if resume upload feature not visible
            const resumeButton = page.locator('text=Upload Resume');
            if (!(await resumeButton.isVisible())) {
                test.skip();
            }

            // Step 1: Click upload resume
            await resumeButton.click();

            // Step 2: Upload file
            const fileInput = page.locator('input[type="file"]');
            await fileInput.setInputFiles('tests/fixtures/sample-resume.pdf');

            // Step 3: Wait for analysis
            await page.waitForSelector('text=Analysis complete', { timeout: 30000 });

            // Step 4: Verify results displayed
            await expect(page.locator('text=Skills')).toBeVisible();
            await expect(page.locator('text=Recommendations')).toBeVisible();
        });
    });

    test.describe('Production Readiness Checks', () => {

        test('verify application loads', async ({ page }) => {
            await page.goto(CLIENT_URL);
            await expect(page).toHaveTitle(/CareerRoad/i);
            await expect(page.locator('text=Sign In')).toBeVisible();
        });

        test('verify API health', async ({ request }) => {
            const response = await request.get('http://localhost:8005/api/roadmap-templates');
            expect(response.status()).toBe(200);
        });

        test('verify session persistence', async ({ page, context }) => {
            // Login
            await page.goto(`${CLIENT_URL}/login`);
            await page.fill('input[name="email"]', testUser.email);
            await page.fill('input[name="password"]', testUser.password);
            await page.click('button[type="submit"]');
            await page.waitForURL(/.*dashboard/);

            // Refresh page
            await page.reload();

            // Verify still logged in
            await expect(page.locator('text=' + testUser.firstName)).toBeVisible();
        });

        test('verify logout works', async ({ page }) => {
            // Login
            await page.goto(`${CLIENT_URL}/login`);
            await page.fill('input[name="email"]', testUser.email);
            await page.fill('input[name="password"]', testUser.password);
            await page.click('button[type="submit"]');
            await page.waitForURL(/.*dashboard/);

            // Logout
            await page.click('button:has-text("Logout")');

            // Verify redirected to login
            await expect(page).toHaveURL(/.*login/);
        });

        test('verify protected routes redirect', async ({ page }) => {
            // Try to access protected route without login
            await page.goto(`${CLIENT_URL}/dashboard`);

            // Should redirect to login
            await expect(page).toHaveURL(/.*login/);
        });
    });
});
