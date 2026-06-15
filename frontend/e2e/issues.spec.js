const { test, expect } = require('@playwright/test');

async function setupProjectPage(page) {
  const uid = Date.now() + '_' + Math.random().toString(36).slice(2);
  const email = `issue_${uid}@example.com`;
  const password = 'password123';
  const projectName = `Issue Test Project ${uid}`;

  await page.goto('/register');
  await page.fill('input[name="name"]', 'Issue Tester');
  await page.fill('input[name="email"]', email);
  await page.fill('input[name="password"]', password);
  await page.click('button[type="submit"]');
  await page.waitForURL(/login/);
  await page.fill('input[name="email"]', email);
  await page.fill('input[name="password"]', password);
  await page.click('button[type="submit"]');
  await page.waitForURL(/dashboard/);

  await page.click('text=+ New Project');
  await page.fill('input[placeholder="Project name *"]', projectName);
  await page.click('text=Create Project');
  await expect(page.locator(`text=${projectName}`)).toBeVisible({ timeout: 10000 });
  await page.click(`text=${projectName}`);
  await page.waitForURL(/projects\/\d+/);
}

test.describe('UI-TC-03: Create Issue Flow', () => {
  test('creates a new issue and sees it in the list', async ({ page }) => {
    await setupProjectPage(page);
    await page.click('text=+ New Issue');
    await page.fill('input[placeholder="Issue title *"]', 'Fix the login bug');
    await page.fill('textarea[placeholder="Description (optional)"]', 'Users cannot login on mobile');
    await page.locator('form select').selectOption('HIGH');
    await page.click('text=Create Issue');
    await expect(page.locator('text=Fix the login bug')).toBeVisible({ timeout: 10000 });
  });

  test('shows error when creating issue with empty title', async ({ page }) => {
    await setupProjectPage(page);
    await page.click('text=+ New Issue');
    await page.click('text=Create Issue');
    await expect(page.locator('text=Issue title is required')).toBeVisible();
  });
});