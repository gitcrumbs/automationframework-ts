/**
 * data.fixture.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * Test data factories. Generates realistic, unique test data for every test run
 * using randomisation so tests never conflict with each other in parallel.
 *
 * No external libraries required — pure TypeScript.
 * (Optional: swap generators with @faker-js/faker for richer data.)
 *
 * Fixtures exposed:
 *  - testUser      → a fresh user object with unique email per test
 *  - testProduct   → a product data object
 *  - timestamp     → a unique timestamp string (useful for unique names/IDs)
 *  - randomString  → utility function to generate a random alphanumeric string
 *
 * Usage:
 *   test('register new user', async ({ page, testUser }) => {
 *     await page.fill('[name=email]', testUser.email);
 *     await page.fill('[name=name]',  testUser.name);
 *   });
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { test as base } from '@playwright/test';

// ── Types ────────────────────────────────────────────────────────────────────

export interface TestUser {
  name:      string;
  email:     string;
  password:  string;
  role:      'admin' | 'editor' | 'viewer';
}

export interface TestProduct {
  name:        string;
  sku:         string;
  price:       number;
  description: string;
  category:    string;
}

export type DataFixtures = {
  testUser:     TestUser;
  testProduct:  TestProduct;
  timestamp:    string;
  randomString: (length?: number) => string;
};

// ── Helpers ──────────────────────────────────────────────────────────────────

function makeRandomString(length = 8): string {
  return Math.random().toString(36).substring(2, 2 + length);
}

function makeTimestamp(): string {
  return new Date().toISOString().replace(/[:.]/g, '-');
}

// ── Fixture Extension ────────────────────────────────────────────────────────

export const test = base.extend<DataFixtures>({

  /**
   * testUser
   * ────────
   * A unique user object per test. The email is randomised so parallel
   * tests that create users never collide in the database.
   */
  testUser: async ({}, use) => {
    const id = makeRandomString(6);
    await use({
      name:     `Test User ${id}`,
      email:    `test.user.${id}@qa.example.com`,
      password: `Passw0rd!${id}`,
      role:     'editor',
    });
  },

  /**
   * testProduct
   * ───────────
   * A unique product object per test run.
   */
  testProduct: async ({}, use) => {
    const id  = makeRandomString(6);
    const sku = `SKU-${id.toUpperCase()}`;
    await use({
      name:        `Product ${id}`,
      sku,
      price:       parseFloat((Math.random() * 100 + 9.99).toFixed(2)),
      description: `Auto-generated product for test run ${id}`,
      category:    'Electronics',
    });
  },

  /**
   * timestamp
   * ─────────
   * ISO timestamp string with colons/dots replaced, safe for filenames and IDs.
   * Example: "2026-02-19T10-30-45-123Z"
   */
  timestamp: async ({}, use) => {
    await use(makeTimestamp());
  },

  /**
   * randomString
   * ────────────
   * A utility function injected directly into tests.
   * Call it however many times you need within a single test.
   *
   * Example:
   *   const tag = randomString(4);  // e.g. "k3xp"
   */
  randomString: async ({}, use) => {
    await use(makeRandomString);
  },
});

export { expect } from '@playwright/test';
