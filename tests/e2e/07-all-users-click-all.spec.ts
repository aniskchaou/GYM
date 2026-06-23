/**
 * Comprehensive role-based UI test
 * ─ Logs in as each user role
 * ─ Visits every nav page available to that role
 * ─ Clicks every visible button/menu item on each page
 * ─ Asserts no 404 at any point (HTTP status + page text)
 */

import { test, expect, Page } from '@playwright/test';
import { login, USERS } from './helpers/auth';

// ─── helpers ────────────────────────────────────────────────────────────────

/** Attach a response listener and return the collected statuses array */
function track404s(page: Page): number[] {
  const statuses: number[] = [];
  page.on('response', (res) => {
    if (
      res.url().includes('localhost:3000') &&
      res.request().resourceType() === 'document'
    ) {
      statuses.push(res.status());
    }
  });
  return statuses;
}

async function assert404Free(page: Page, statuses: number[], label: string) {
  // 1. HTTP status check
  for (const s of statuses) {
    expect(s, `HTTP ${s} on "${label}"`).not.toBe(404);
  }
  // 2. Rendered text check
  const body = await page.locator('body').innerText().catch(() => '');
  expect(
    body.toLowerCase(),
    `"not found" text on "${label}"`
  ).not.toMatch(/this page could not be found|404.*not found|page not found/);
}

async function visitAndCheck(page: Page, url: string) {
  const statuses: number[] = [];
  const handler = (res: any) => {
    if (
      res.url().includes('localhost:3000') &&
      res.request().resourceType() === 'document'
    ) statuses.push(res.status());
  };
  page.on('response', handler);
  await page.goto(url);
  await page.waitForLoadState('load');
  await assert404Free(page, statuses, url);
  page.off('response', handler);
}

/** Click a button/link by text if it is visible (best-effort, no throw) */
async function clickIfVisible(page: Page, locator: any) {
  try {
    if (await locator.isVisible({ timeout: 1500 })) {
      await locator.click({ timeout: 2000 });
      await page.waitForLoadState('load', { timeout: 5000 }).catch(() => {});
    }
  } catch { /* element gone or timeout — skip */ }
}

// ─── Nav maps ────────────────────────────────────────────────────────────────

const OWNER_PAGES = [
  '/dashboard/owner',
  '/dashboard/members',
  '/dashboard/attendance',
  '/dashboard/classes',
  '/dashboard/trainers',
  '/dashboard/memberships',
  '/dashboard/payments',
  '/dashboard/reports',
  '/dashboard/branches',
  '/dashboard/workouts',   // not in sidebar for owner but page exists
  '/dashboard/notifications',
  '/dashboard/settings',
];

const RECEPTIONIST_PAGES = [
  '/dashboard/reception',
  '/dashboard/members',
  '/dashboard/attendance',
  '/dashboard/classes',
  '/dashboard/memberships',
  '/dashboard/notifications',
];

const TRAINER_PAGES = [
  '/dashboard/trainer',
  '/dashboard/classes',
  '/dashboard/members',
  '/dashboard/workouts',
  '/dashboard/notifications',
];

const MEMBER_PAGES = [
  '/dashboard/member',
  '/dashboard/classes',
  '/dashboard/bookings',
  '/dashboard/my-membership',
  '/dashboard/workouts',
  '/dashboard/notifications',
];

// ─── Per-page button interactions ────────────────────────────────────────────

async function interactPage(page: Page, url: string) {
  const path = new URL(url, 'http://localhost:3000').pathname;

  if (path === '/dashboard/settings') {
    // Click every settings tab
    for (const tabLabel of ['Profile', 'Gym Info', 'Notifications', 'Billing']) {
      await clickIfVisible(page, page.getByRole('button', { name: tabLabel }));
      await assert404Free(page, [], `settings tab ${tabLabel}`);
    }
  }

  if (path === '/dashboard/members') {
    // Filter button
    await clickIfVisible(page, page.locator('button', { hasText: /filter/i }));
    // "Add Member" / "New member" link if present
    await clickIfVisible(page, page.locator('a[href*="/members/new"]'));
    if (page.url().includes('/members/new')) {
      await assert404Free(page, [], '/dashboard/members/new');
      await page.goBack();
      await page.waitForLoadState('load');
    }
    // Pagination next if enabled
    const nextBtn = page.locator('button[aria-label*="next" i], button svg.lucide-chevron-right').first();
    await clickIfVisible(page, nextBtn);
  }

  if (path === '/dashboard/classes') {
    // "Book" or "Add Class" button
    const bookBtn = page.locator('button', { hasText: /book|add class/i }).first();
    await clickIfVisible(page, bookBtn);
  }

  if (path === '/dashboard/bookings') {
    // Cancel first booking if any
    const cancelBtn = page.locator('button', { hasText: /cancel/i }).first();
    await clickIfVisible(page, cancelBtn);
  }

  if (path === '/dashboard/attendance') {
    // Manual check-in
    const manualBtn = page.locator('button', { hasText: /manual/i }).first();
    await clickIfVisible(page, manualBtn);
    // QR check-in
    const qrBtn = page.locator('button', { hasText: /qr/i }).first();
    await clickIfVisible(page, qrBtn);
  }

  if (path === '/dashboard/notifications') {
    // Mark all read
    const markAllBtn = page.locator('button', { hasText: /mark all/i }).first();
    await clickIfVisible(page, markAllBtn);
  }

  if (path === '/dashboard/payments') {
    // Pagination prev/next
    const prevBtn = page.locator('button[disabled=false]').filter({ hasText: '' }).nth(0);
    const nextBtn = page.locator('button[disabled=false]').filter({ hasText: '' }).nth(1);
    await clickIfVisible(page, prevBtn);
    await clickIfVisible(page, nextBtn);
  }

  // Topbar notification bell (present on all pages)
  await clickIfVisible(page, page.locator('header button').filter({ has: page.locator('svg') }).first());
}

// ─── Role test factory ───────────────────────────────────────────────────────

function roleTest(
  roleLabel: string,
  user: { email: string; password: string },
  pages: string[]
) {
  test.describe(`[${roleLabel}] — visit all pages & click all buttons`, () => {
    test.beforeEach(async ({ page }) => {
      await login(page, user.email, user.password);
    });

    // 1. Visit each page and assert no 404
    for (const url of pages) {
      test(`no 404 on ${url}`, async ({ page }) => {
        await visitAndCheck(page, url);
      });
    }

    // 2. Interact with each page (click buttons/menus) and assert no 404
    for (const url of pages) {
      test(`interact & no 404 on ${url}`, async ({ page }) => {
        await page.goto(url);
        await page.waitForLoadState('load');

        // Click every visible sidebar nav link for this role
        const navLinks = page.locator('aside nav a');
        const count = await navLinks.count();
        for (let i = 0; i < count; i++) {
          const link = navLinks.nth(i);
          const href = await link.getAttribute('href').catch(() => null);
          if (!href) continue;
          await clickIfVisible(page, link);
          const docStatuses: number[] = [];
          const handler = (res: any) => {
            if (res.url().includes('localhost:3000') && res.request().resourceType() === 'document')
              docStatuses.push(res.status());
          };
          page.on('response', handler);
          await page.waitForLoadState('load', { timeout: 5000 }).catch(() => {});
          await assert404Free(page, docStatuses, `nav click → ${href}`);
          page.off('response', handler);
          // Navigate back to original page for next iteration
          if (!page.url().includes(url.slice(1))) {
            await page.goto(url);
            await page.waitForLoadState('load');
          }
        }

        // Interact with page-specific buttons
        await interactPage(page, url);

        // Final 404 check after all interactions
        const body = await page.locator('body').innerText().catch(() => '');
        expect(body.toLowerCase()).not.toMatch(/this page could not be found|404.*not found|page not found/);
      });
    }

    // 3. Click "Sign out" — should redirect to /auth/login without 404
    test('sign out works without 404', async ({ page }) => {
      await page.goto(pages[0]);
      await page.waitForLoadState('load');
      const statuses: number[] = [];
      page.on('response', (res) => {
        if (res.url().includes('localhost:3000') && res.request().resourceType() === 'document')
          statuses.push(res.status());
      });
      await page.locator('button', { hasText: /sign out/i }).click();
      await page.waitForURL(/\/auth\/login/, { timeout: 10000 });
      await assert404Free(page, statuses, 'sign out redirect');
    });
  });
}

// ─── Register all four roles ─────────────────────────────────────────────────

roleTest('GYM_OWNER',     USERS.owner,        OWNER_PAGES);
roleTest('RECEPTIONIST',  USERS.receptionist, RECEPTIONIST_PAGES);
roleTest('TRAINER',       USERS.trainer,      TRAINER_PAGES);
roleTest('MEMBER',        USERS.member,       MEMBER_PAGES);
