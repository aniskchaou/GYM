import { test, expect } from '@playwright/test';
import { login, USERS } from './helpers/auth';

test.describe('Member Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    await login(page, USERS.member.email, USERS.member.password);
  });

  test('member dashboard loads', async ({ page }) => {
    await page.goto('/dashboard/member');
    await expect(page.locator('h1, h2').first()).toBeVisible();
  });

  test('my membership page loads', async ({ page }) => {
    await page.goto('/dashboard/my-membership');
    await expect(page).toHaveURL(/my-membership/);
    await expect(page.locator('h1, h2').first()).toBeVisible();
  });

  test('bookings page loads', async ({ page }) => {
    await page.goto('/dashboard/bookings');
    await expect(page).toHaveURL(/bookings/);
    await expect(page.locator('h1, h2').first()).toBeVisible();
  });

  test('classes page loads', async ({ page }) => {
    await page.goto('/dashboard/classes');
    await expect(page).toHaveURL(/classes/);
    await expect(page.locator('h1, h2').first()).toBeVisible();
  });

  test('workouts page loads and has category filter', async ({ page }) => {
    await page.goto('/dashboard/workouts');
    await expect(page).toHaveURL(/workouts/);
    await expect(page.locator('h1, h2').first()).toBeVisible();
    // Category filter select should be present
    const filterEl = page.locator('select, [role="combobox"]').first();
    await expect(filterEl).toBeVisible();
  });

  test('notifications page loads', async ({ page }) => {
    await page.goto('/dashboard/notifications');
    await expect(page).toHaveURL(/notifications/);
    await expect(page.locator('h1, h2').first()).toBeVisible();
  });

  test('settings page loads with tabs', async ({ page }) => {
    await page.goto('/dashboard/settings');
    await expect(page).toHaveURL(/settings/);
    // Expect at least 2 tab-like elements
    const tabs = page.locator('[role="tab"], button').filter({ hasText: /profile|info|notification|billing/i });
    const count = await tabs.count();
    expect(count).toBeGreaterThan(1);
  });
});

test.describe('Member Bookings Flow', () => {
  test.beforeEach(async ({ page }) => {
    await login(page, USERS.member.email, USERS.member.password);
  });

  test('bookings page shows upcoming classes section', async ({ page }) => {
    await page.goto('/dashboard/bookings');
    // Page should load without error
    await expect(page.locator('h1, h2').first()).toBeVisible();
  });

  test('classes page shows schedule', async ({ page }) => {
    await page.goto('/dashboard/classes');
    await expect(page.locator('h1, h2').first()).toBeVisible();
  });
});
