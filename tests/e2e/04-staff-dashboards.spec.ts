import { test, expect } from '@playwright/test';
import { login, USERS } from './helpers/auth';

test.describe('Receptionist Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    await login(page, USERS.receptionist.email, USERS.receptionist.password);
  });

  test('reception dashboard loads', async ({ page }) => {
    await page.goto('/dashboard/reception');
    await expect(page.locator('h1, h2').first()).toBeVisible();
  });

  test('attendance page loads', async ({ page }) => {
    await page.goto('/dashboard/attendance');
    await expect(page).toHaveURL(/attendance/);
    await expect(page.locator('h1, h2').first()).toBeVisible();
  });

  test('members list page loads', async ({ page }) => {
    await page.goto('/dashboard/members');
    await expect(page).toHaveURL(/members/);
    await expect(page.locator('h1, h2').first()).toBeVisible();
  });

  test('memberships page loads', async ({ page }) => {
    await page.goto('/dashboard/memberships');
    await expect(page.locator('h1, h2').first()).toBeVisible();
  });
});

test.describe('Trainer Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    await login(page, USERS.trainer.email, USERS.trainer.password);
  });

  test('trainer dashboard loads', async ({ page }) => {
    await page.goto('/dashboard/trainer');
    await expect(page.locator('h1, h2').first()).toBeVisible();
  });

  test('classes page loads for trainer', async ({ page }) => {
    await page.goto('/dashboard/classes');
    await expect(page).toHaveURL(/classes/);
    await expect(page.locator('h1, h2').first()).toBeVisible();
  });

  test('members page loads for trainer', async ({ page }) => {
    await page.goto('/dashboard/members');
    await expect(page).toHaveURL(/members/);
    await expect(page.locator('h1, h2').first()).toBeVisible();
  });

  test('workouts page loads for trainer', async ({ page }) => {
    await page.goto('/dashboard/workouts');
    await expect(page).toHaveURL(/workouts/);
    await expect(page.locator('h1, h2').first()).toBeVisible();
  });
});
