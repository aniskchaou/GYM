import { Page } from '@playwright/test';

export const USERS = {
  owner: { email: 'owner@demogym.com', password: 'Owner@1234', role: 'GYM_OWNER' },
  receptionist: { email: 'reception@demogym.com', password: 'Reception@1234', role: 'RECEPTIONIST' },
  trainer: { email: 'trainer@demogym.com', password: 'Trainer@1234', role: 'TRAINER' },
  member: { email: 'member@demogym.com', password: 'Member@1234', role: 'MEMBER' },
};

export async function login(page: Page, email: string, password: string) {
  await page.goto('/auth/login');
  await page.fill('input[type="email"]', email);
  await page.fill('input[type="password"]', password);
  await page.click('button[type="submit"]');
  // Wait for redirect away from login page
  await page.waitForURL(/\/dashboard/, { timeout: 10000 });
}

export async function logout(page: Page) {
  // Click profile/logout button in topbar
  const logoutBtn = page.locator('button', { hasText: /log.?out|sign.?out/i }).first();
  if (await logoutBtn.isVisible()) {
    await logoutBtn.click();
  } else {
    await page.goto('/auth/login');
  }
}
