/**
 * auth.fixture.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * Handles browser-level authentication for UI tests.
 *
 * TWO strategies provided:
 *  1. storageStatePage  → reuses a saved login session (cookies + localStorage)
 *                         so you only hit the login endpoint ONCE per worker.
 *  2. freshLoginPage    → does a real login every single test (useful for
 *                         testing the login flow itself, or when session state
 *                         must be completely clean).
 *
 * Usage:
 *   import { test, expect } from '../fixtures';
 *   test('dashboard loads', async ({ storageStatePage }) => { ... });
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { test as base, Page, BrowserContext } from '@playwright/test';
import path from 'path';
import fs from 'fs';

// ── Types ────────────────────────────────────────────────────────────────────

export type AuthFixtures = {
  /** A page that is already authenticated via saved storage state (fast path). */
  storageStatePage: Page;

  /** A page where login is performed fresh for every test (slow but clean). */
  freshLoginPage: Page;

  /** Exposes the authenticated browser context directly. */
  authenticatedContext: BrowserContext;
};

// ── Constants ────────────────────────────────────────────────────────────────

const STORAGE_STATE_PATH = path.resolve(__dirname, '../.auth/session.json');
const BASE_URL            = process.env.BASE_URL     ?? 'http://localhost:3000';
const TEST_USER_EMAIL     = process.env.TEST_USER    ?? 'admin@example.com';
const TEST_USER_PASSWORD  = process.env.TEST_PASS    ?? 'password123';

// ── Fixture Extension ────────────────────────────────────────────────────────

export const test = base.extend<AuthFixtures>({

  /**
   * storageStatePage
   * ────────────────
   * Loads a pre-saved browser session from disk (.auth/session.json).
   * The session file is generated once by the global setup (see globalSetup.ts).
   * This makes your tests fast — no login round-trip per test.
   */
  storageStatePage: async ({ browser }, use) => {
    // Create a new context from the saved session
    const context = await browser.newContext({
      storageState: STORAGE_STATE_PATH,
    });
    const page = await context.newPage();
    await page.goto(BASE_URL);

    await use(page);

    // Teardown: close context to free resources
    await context.close();
  },

  /**
   * freshLoginPage
   * ──────────────
   * Performs a real login via the UI before yielding the page to the test.
   * Use this when you need to test post-login state, redirects, or role-based access.
   */
  freshLoginPage: async ({ page }, use) => {
    await page.goto(`${BASE_URL}/login`);
    await page.getByLabel('Email').fill(TEST_USER_EMAIL);
    await page.getByLabel('Password').fill(TEST_USER_PASSWORD);
    await page.getByRole('button', { name: /log in/i }).click();
    await page.waitForURL('**/dashboard');

    await use(page);

    // Teardown: clear storage to prevent cross-test pollution
    await page.evaluate(() => {
      localStorage.clear();
      sessionStorage.clear();
    });
  },

  /**
   * authenticatedContext
   * ────────────────────
   * Exposes the full BrowserContext for tests that need multi-tab scenarios
   * or need to open additional pages in the same session.
   */
  authenticatedContext: async ({ browser }, use) => {
    const context = await browser.newContext({
      storageState: STORAGE_STATE_PATH,
    });
    await use(context);
    await context.close();
  },
});

export { expect } from '@playwright/test';
