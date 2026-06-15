const { test, expect } = require('@playwright/test');

async function registerAndLogin(page) {
  const uid = Date.now() + '_' + Math.random().toString(36).slice(2);
  const email = `project_${uid}@example.com`;
  const password = 'password123';
  await page.goto('/register');
  await page.fill('input[name="name"]', 'Project Tester');
  await page.fill('input[name="email"]', email);
  await page.fill('input[name="password"]', password);
  await page.click('button[type="submit"]');
  await page.waitForURL(/login/);
  await page.fill('input[name="email"]', email);
  await page.fill('input[name="password"]', password);
  await page.click('button[type="submit"]');
  await page.waitForURL(/dashboard/);
  return uid;
}

test.describe('UI-TC-02: Create Project Flow', () => {
  test('creates a new project and sees it in the list', async ({ page }) => {
    const uid = await registerAndLogin(page);
    const projectName = `My Playwright Project ${uid}`;
    await page.click('text=+ New Project');
    await page.fill('input[placeholder="Project name *"]', projectName);
    await page.fill('input[placeholder="Description (optional)"]', 'Created by automation');
    await page.click('text=Create Project');
    await expect(page.locator(`text=${projectName}`)).toBeVisible({ timeout: 10000 });
  });

  test('shows error when creating project with empty name', async ({ page }) => {
    await registerAndLogin(page);
    await page.click('text=+ New Project');
    await page.click('text=Create Project');
    await expect(page.locator('text=Project name is required')).toBeVisible();
  });
});