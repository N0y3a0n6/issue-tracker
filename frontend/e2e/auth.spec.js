const { test, expect } = require('@playwright/test');

const TEST_USER = {
  name: 'Test User',
  email: `testuser_${Date.now()}@example.com`,
  password: 'password123',
};

test.describe('UI-TC-01: User Registration and Login Flow', () => {
  test('registers a new user and logs in', async ({ page }) => {
    await page.goto('/register');
    await page.fill('input[name="name"]', TEST_USER.name);
    await page.fill('input[name="email"]', TEST_USER.email);
    await page.fill('input[name="password"]', TEST_USER.password);
    await page.click('button[type="submit"]');
    await page.waitForURL(/login/);
    await page.fill('input[name="email"]', TEST_USER.email);
    await page.fill('input[name="password"]', TEST_USER.password);
    await page.click('button[type="submit"]');
    await page.waitForURL(/dashboard/);
    await expect(page.locator('text=Total Projects')).toBeVisible();
  });

  test('shows error for invalid login credentials', async ({ page }) => {
    await page.goto('/login');
    await page.fill('input[name="email"]', 'wrong@example.com');
    await page.fill('input[name="password"]', 'wrongpassword');
    await page.click('button[type="submit"]');
    await expect(page.locator('text=Invalid email or password')).toBeVisible();
  });
});