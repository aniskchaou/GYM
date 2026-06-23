import { test, expect } from '@playwright/test';
import { login, USERS } from './helpers/auth';

test.describe('Owner Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    await login(page, USERS.owner.email, USERS.owner.password);
  });

  test('owner dashboard loads with KPI cards', async ({ page }) => {
    await page.goto('/dashboard/owner');
    await expect(page.locator('h1, h2').first()).toBeVisible();
  });

  test('sidebar navigation is visible', async ({ page }) => {
    await expect(page.locator('nav, aside').first()).toBeVisible();
  });

  test('can navigate to Members page', async ({ page }) => {
    await page.goto('/dashboard/members');
    await expect(page).toHaveURL(/members/);
    await expect(page.locator('h1, h2').first()).toBeVisible();
  });

  test('can navigate to Classes page', async ({ page }) => {
    await page.goto('/dashboard/classes');
    await expect(page).toHaveURL(/classes/);
    await expect(page.locator('h1, h2').first()).toBeVisible();
  });

  test('can navigate to Trainers page', async ({ page }) => {
    await page.goto('/dashboard/trainers');
    await expect(page).toHaveURL(/trainers/);
    await expect(page.locator('h1, h2').first()).toBeVisible();
  });

  test('can navigate to Memberships page', async ({ page }) => {
    await page.goto('/dashboard/memberships');
    await expect(page).toHaveURL(/memberships/);
    await expect(page.locator('h1, h2').first()).toBeVisible();
  });

  test('can navigate to Payments page', async ({ page }) => {
    await page.goto('/dashboard/payments');
    await expect(page).toHaveURL(/payments/);
    await expect(page.locator('h1, h2').first()).toBeVisible();
  });

  test('can navigate to Reports page', async ({ page }) => {
    await page.goto('/dashboard/reports');
    await expect(page).toHaveURL(/reports/);
    await expect(page.locator('h1, h2').first()).toBeVisible();
  });

  test('can navigate to Branches page', async ({ page }) => {
    await page.goto('/dashboard/branches');
    await expect(page).toHaveURL(/branches/);
    await expect(page.locator('h1, h2').first()).toBeVisible();
  });

  test('can navigate to Attendance page', async ({ page }) => {
    await page.goto('/dashboard/attendance');
    await expect(page).toHaveURL(/attendance/);
    await expect(page.locator('h1, h2').first()).toBeVisible();
  });

  test('can navigate to Notifications page', async ({ page }) => {
    await page.goto('/dashboard/notifications');
    await expect(page).toHaveURL(/notifications/);
    await expect(page.locator('h1, h2').first()).toBeVisible();
  });

  test('can navigate to Settings page', async ({ page }) => {
    await page.goto('/dashboard/settings');
    await expect(page).toHaveURL(/settings/);
    await expect(page.locator('h1, h2').first()).toBeVisible();
  });

  test('can navigate to Workouts page', async ({ page }) => {
    await page.goto('/dashboard/workouts');
    await expect(page).toHaveURL(/workouts/);
    await expect(page.locator('h1, h2').first()).toBeVisible();
  });
});
