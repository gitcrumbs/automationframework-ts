/**
 * network.fixture.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * Network interception utilities: mock API responses, block third-party scripts,
 * record network traffic, and intercept specific routes in tests.
 *
 * Fixtures exposed:
 *  - mockNetwork     → intercept & stub any URL pattern with custom JSON response
 *  - blockAnalytics  → silently blocks tracking/analytics scripts (faster tests)
 *  - networkLogs     → captures all requests made during a test for assertions
 *
 * Usage:
 *   test('shows error on 500', async ({ page, mockNetwork }) => {
 *     await mockNetwork(page, '/api/users', 500, { error: 'Server Error' });
 *     await page.goto('/users');
 *     await expect(page.getByText('Something went wrong')).toBeVisible();
 *   });
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { test as base, Page, Request } from '@playwright/test';

// ── Types ────────────────────────────────────────────────────────────────────

/** Function signature for mocking a network route */
type MockNetworkFn = (
  page:     Page,
  urlGlob:  string | RegExp,
  status:   number,
  body:     Record<string, unknown>
) => Promise<void>;

export type NetworkFixtures = {
  /** Stub any API route with a custom status code and JSON body. */
  mockNetwork: MockNetworkFn;

  /** Blocks common analytics/tracking domains to speed up tests. */
  blockAnalytics: void;

  /** Array of all network requests captured during the test. */
  networkLogs: Request[];
};

// ── Domains to block ─────────────────────────────────────────────────────────

const ANALYTICS_DOMAINS = [
  '**/google-analytics.com/**',
  '**/googletagmanager.com/**',
  '**/hotjar.com/**',
  '**/segment.com/**',
  '**/amplitude.com/**',
  '**/mixpanel.com/**',
  '**/fullstory.com/**',
  '**/intercom.io/**',
];

// ── Fixture Extension ────────────────────────────────────────────────────────

export const test = base.extend<NetworkFixtures>({

  /**
   * mockNetwork
   * ───────────
   * Returns a function you can call inside a test to stub any URL.
   * Supports glob patterns and RegExp.
   *
   * Example:
   *   await mockNetwork(page, '/api/products', 200, { items: [] });
   *   await mockNetwork(page, /.*\/auth\/.*/, 401, { message: 'Unauthorized' });
   */
  mockNetwork: async ({}, use) => {
    const mock: MockNetworkFn = async (page, urlGlob, status, body) => {
      await page.route(urlGlob, async (route) => {
        await route.fulfill({
          status,
          contentType: 'application/json',
          body: JSON.stringify(body),
        });
      });
    };

    await use(mock);
    // Routes are automatically unregistered when the page closes — no manual cleanup needed
  },

  /**
   * blockAnalytics
   * ──────────────
   * Automatically applied when this fixture is used in a test.
   * Aborts all requests to known analytics/tracking domains.
   * Speeds up tests by 200–800ms on pages with heavy third-party scripts.
   */
  blockAnalytics: [async ({ page }, use) => {
    for (const pattern of ANALYTICS_DOMAINS) {
      await page.route(pattern, (route) => route.abort());
    }
    await use();
  }, { auto: false }], // Set auto: true to apply to EVERY test automatically

  /**
   * networkLogs
   * ───────────
   * Collects all network requests made during the test.
   * Useful for asserting that a specific API was called, or wasn't called.
   *
   * Example:
   *   test('...', async ({ page, networkLogs }) => {
   *     await page.goto('/checkout');
   *     await page.getByRole('button', { name: 'Pay' }).click();
   *     const paymentCall = networkLogs.find(r => r.url().includes('/api/payment'));
   *     expect(paymentCall).toBeDefined();
   *     expect(paymentCall?.method()).toBe('POST');
   *   });
   */
  networkLogs: async ({ page }, use) => {
    const logs: Request[] = [];
    page.on('request', (req) => logs.push(req));
    await use(logs);
    // logs is populated automatically during the test
  },
});

export { expect } from '@playwright/test';
