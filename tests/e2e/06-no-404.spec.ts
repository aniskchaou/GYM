import { test, expect } from '@playwright/test';
import { login, USERS } from './helpers/auth';

// All known public routes (no auth required)
const PUBLIC_ROUTES = [
  '/',
  '/auth/login',
  '/auth/register',
];

// All known authenticated dashboard routes
const DASHBOARD_ROUTES = [
  '/dashboard/owner',
  '/dashboard/member',
  '/dashboard/reception',
  '/dashboard/trainer',
  '/dashboard/members',
  '/dashboard/classes',
  '/dashboard/trainers',
  '/dashboard/memberships',
  '/dashboard/payments',
  '/dashboard/reports',
  '/dashboard/branches',
  '/dashboard/attendance',
  '/dashboard/notifications',
  '/dashboard/settings',
  '/dashboard/workouts',
  '/dashboard/bookings',
  '/dashboard/my-membership',
];

test.describe('404 Checks — Public Routes', () => {
  for (const route of PUBLIC_ROUTES) {
    test(`no 404 on ${route}`, async ({ page }) => {
      const responses: number[] = [];
      page.on('response', (res) => {
        if (res.url().includes('localhost:3000') && res.request().resourceType() === 'document') {
          responses.push(res.status());
        }
      });

      await page.goto(route);
      await page.waitForLoadState('load');

      // Assert the page HTML response was not 404
      const docStatus = responses[0];
      if (docStatus !== undefined) {
        expect(docStatus, `HTTP ${docStatus} on ${route}`).not.toBe(404);
      }

      // Assert no "404" heading or Next.js "page not found" text is shown
      const bodyText = await page.locator('body').innerText();
      expect(bodyText.toLowerCase(), `"not found" text on ${route}`).not.toMatch(/this page could not be found|404.*not found|page not found/);
    });
  }
});

test.describe('404 Checks — Dashboard Routes (authenticated as owner)', () => {
  test.beforeEach(async ({ page }) => {
    await login(page, USERS.owner.email, USERS.owner.password);
  });

  for (const route of DASHBOARD_ROUTES) {
    test(`no 404 on ${route}`, async ({ page }) => {
      const responses: number[] = [];
      page.on('response', (res) => {
        if (res.url().includes('localhost:3000') && res.request().resourceType() === 'document') {
          responses.push(res.status());
        }
      });

      await page.goto(route);
      await page.waitForLoadState('load');

      const docStatus = responses[0];
      if (docStatus !== undefined) {
        expect(docStatus, `HTTP ${docStatus} on ${route}`).not.toBe(404);
      }

      const bodyText = await page.locator('body').innerText();
      expect(bodyText.toLowerCase(), `"not found" text on ${route}`).not.toMatch(/this page could not be found|404.*not found|page not found/);
    });
  }
});

test.describe('404 Checks — Unknown Routes', () => {
  test('unknown public route returns 404 page', async ({ page }) => {
    const statuses: number[] = [];
    page.on('response', (res) => {
      if (res.url().includes('localhost:3000') && res.request().resourceType() === 'document') {
        statuses.push(res.status());
      }
    });

    await page.goto('/this-route-does-not-exist-xyz123');
    await page.waitForLoadState('load');

    // Next.js should respond with 404 or show a not-found page
    const bodyText = await page.locator('body').innerText();
    const got404Status = statuses.some((s) => s === 404);
    const got404Text = /not found|404/i.test(bodyText);

    expect(
      got404Status || got404Text,
      `Expected 404 status or "not found" text for unknown route. Status(es): ${statuses.join(', ')}`
    ).toBe(true);
  });
});
