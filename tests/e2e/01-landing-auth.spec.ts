import { test, expect } from '@playwright/test';
import { login, USERS } from './helpers/auth';

// ─── Landing Page ──────────────────────────────────────────────────────────────

test.describe('Landing Page', () => {
  test('shows marketing page with nav links', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/GymFlow/i);
    await expect(page.locator('text=GymFlow').first()).toBeVisible();
    await expect(page.locator('a', { hasText: /get started/i }).first()).toBeVisible();
    await expect(page.locator('a', { hasText: /sign in/i }).first()).toBeVisible();
  });

  test('features section is visible', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('heading', { name: 'Member Management' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Class Scheduling' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Payments & Billing' })).toBeVisible();
  });

  test('pricing section shows plans', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('heading', { name: 'Starter' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Growth' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Enterprise' })).toBeVisible();
  });

  test('Sign in link navigates to login', async ({ page }) => {
    await page.goto('/');
    await page.locator('a', { hasText: /^sign in$/i }).first().click();
    await expect(page).toHaveURL(/auth\/login/);
  });

  test('Get started link navigates to register', async ({ page }) => {
    await page.goto('/');
    await page.locator('a', { hasText: /get started free/i }).first().click();
    await expect(page).toHaveURL(/auth\/register/);
  });
});

// ─── Authentication ─────────────────────────────────────────────────────────────

test.describe('Authentication', () => {
  test('login page renders correctly', async ({ page }) => {
    await page.goto('/auth/login');
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toBeVisible();
  });

  test('register page renders correctly', async ({ page }) => {
    await page.goto('/auth/register');
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toBeVisible();
  });

  test('shows error on invalid credentials', async ({ page }) => {
    await page.goto('/auth/login');
    await page.fill('input[type="email"]', 'wrong@example.com');
    await page.fill('input[type="password"]', 'wrongpassword');
    await page.click('button[type="submit"]');
    // Should show error message or stay on login page
    await page.waitForTimeout(2000);
    const url = page.url();
    expect(url).toMatch(/auth\/login/);
  });

  test('owner can log in', async ({ page }) => {
    await login(page, USERS.owner.email, USERS.owner.password);
    await expect(page).toHaveURL(/dashboard/);
  });

  test('member can log in', async ({ page }) => {
    await login(page, USERS.member.email, USERS.member.password);
    await expect(page).toHaveURL(/dashboard/);
  });

  test('receptionist can log in', async ({ page }) => {
    await login(page, USERS.receptionist.email, USERS.receptionist.password);
    await expect(page).toHaveURL(/dashboard/);
  });

  test('trainer can log in', async ({ page }) => {
    await login(page, USERS.trainer.email, USERS.trainer.password);
    await expect(page).toHaveURL(/dashboard/);
  });
});
