const { test, expect } = require('@playwright/test');

async function setupIssue(page) {
  const uid = Date.now() + '_' + Math.random().toString(36).slice(2);
  const email = `status_${uid}@example.com`;
  const password = 'password123';
  const projectName = `Status Test Project ${uid}`;

  await page.goto('/register');
  await page.fill('input[name="name"]', 'Status Tester');
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

  await page.click('text=+ New Issue');
  await page.fill('input[placeholder="Issue title *"]', 'Status Test Issue');
  await page.click('text=Create Issue');
  await expect(page.locator('text=Status Test Issue')).toBeVisible({ timeout: 10000 });
}

test.describe('UI-TC-04: Issue Status Change Flow', () => {
  test('changes issue status from TODO to IN_PROGRESS', async ({ page }) => {
    await setupIssue(page);
    const statusSelect = page.locator('select.text-xs').first();
    await statusSelect.selectOption('IN_PROGRESS');
    await expect(statusSelect).toHaveValue('IN_PROGRESS');
  });

  test('changes issue status to DONE', async ({ page }) => {
    await setupIssue(page);
    const statusSelect = page.locator('select.text-xs').first();
    await statusSelect.selectOption('DONE');
    await expect(statusSelect).toHaveValue('DONE');
  });
});