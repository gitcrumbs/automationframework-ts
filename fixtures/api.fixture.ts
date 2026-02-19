/**
 * api.fixture.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * Provides typed API request helpers that share the same authenticated session
 * as the browser. This means your API calls and UI assertions work in the same
 * test without re-authenticating.
 *
 * Fixtures exposed:
 *  - apiClient      → bare Playwright APIRequestContext (unauthenticated)
 *  - authedApiClient → APIRequestContext with auth token injected automatically
 *
 * Usage:
 *   import { test, expect } from '../fixtures';
 *   test('creates a user via API then verifies in UI', async ({ authedApiClient, page }) => {
 *     await authedApiClient.post('/users', { data: { name: 'Ashwani' } });
 *     await page.goto('/users');
 *     await expect(page.getByText('Ashwani')).toBeVisible();
 *   });
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { test as base, APIRequestContext, request } from '@playwright/test';

// ── Types ────────────────────────────────────────────────────────────────────

export type ApiFixtures = {
  /** Unauthenticated API client — for testing public endpoints or login flows. */
  apiClient: APIRequestContext;

  /** Authenticated API client — bearer token injected from .env automatically. */
  authedApiClient: APIRequestContext;
};

// ── Helpers ──────────────────────────────────────────────────────────────────

const API_BASE_URL = process.env.API_BASE_URL ?? 'http://localhost:3000/api';
const API_TOKEN    = process.env.API_TOKEN    ?? '';

// ── Fixture Extension ────────────────────────────────────────────────────────

export const test = base.extend<ApiFixtures>({

  /**
   * apiClient
   * ─────────
   * A fresh, unauthenticated API context pointing at your API base URL.
   * Each test gets an isolated context — no cookies or tokens shared.
   */
  apiClient: async ({}, use) => {
    const client = await request.newContext({
      baseURL: API_BASE_URL,
      extraHTTPHeaders: {
        'Content-Type': 'application/json',
        'Accept':       'application/json',
      },
    });

    await use(client);
    await client.dispose(); // Always dispose to release connections
  },

  /**
   * authedApiClient
   * ───────────────
   * An API context with a Bearer token injected from the environment.
   * Uses the same session as UI tests when run together, avoiding double auth.
   */
  authedApiClient: async ({}, use) => {
    const client = await request.newContext({
      baseURL: API_BASE_URL,
      extraHTTPHeaders: {
        'Content-Type':  'application/json',
        'Accept':        'application/json',
        'Authorization': `Bearer ${API_TOKEN}`,
      },
    });

    await use(client);
    await client.dispose();
  },
});

export { expect } from '@playwright/test';
