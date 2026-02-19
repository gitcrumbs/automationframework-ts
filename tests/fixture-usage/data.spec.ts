/**
 * data.spec.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * Demonstrates usage of data fixtures:
 *   - testUser      (unique user object per test — safe for parallel runs)
 *   - testProduct   (unique product object per test)
 *   - timestamp     (unique timestamp string)
 *   - randomString  (utility fn — call as many times as needed)
 *
 * The key insight: every test gets fresh, unique data automatically.
 * No more hardcoded emails that collide when tests run in parallel.
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { test, expect } from '../../fixtures';

// ── testUser fixture ──────────────────────────────────────────────────────────

test.describe('User registration (data-driven)', () => {

  test('can register with auto-generated unique user data', async ({
    page,
    testUser,
  }) => {
    // testUser gives us: { name, email, password, role } — all unique per run
    await page.goto('/register');
    await page.getByLabel('Full Name').fill(testUser.name);
    await page.getByLabel('Email').fill(testUser.email);
    await page.getByLabel('Password').fill(testUser.password);
    await page.getByLabel('Confirm Password').fill(testUser.password);
    await page.getByRole('button', { name: /create account/i }).click();

    await expect(page).toHaveURL(/.*onboarding/);
    await expect(page.getByText(`Welcome, ${testUser.name}`)).toBeVisible();
  });

  test('duplicate email shows validation error', async ({
    page,
    authedApiClient,
    testUser,
  }) => {
    // First, create the user via API
    await authedApiClient.post('/users', { data: testUser });

    // Then try registering the same email in the UI
    await page.goto('/register');
    await page.getByLabel('Email').fill(testUser.email);
    await page.getByLabel('Password').fill(testUser.password);
    await page.getByRole('button', { name: /create account/i }).click();

    await expect(page.getByText(/email already in use/i)).toBeVisible();
  });

});

// ── testProduct fixture ───────────────────────────────────────────────────────

test.describe('Product creation (data-driven)', () => {

  test('can add a new product with generated data', async ({
    storageStatePage,
    testProduct,
  }) => {
    await storageStatePage.goto('/products/new');
    await storageStatePage.getByLabel('Product Name').fill(testProduct.name);
    await storageStatePage.getByLabel('SKU').fill(testProduct.sku);
    await storageStatePage.getByLabel('Price').fill(String(testProduct.price));
    await storageStatePage.getByLabel('Description').fill(testProduct.description);
    await storageStatePage.getByRole('button', { name: /save product/i }).click();

    await expect(storageStatePage.getByText('Product saved successfully')).toBeVisible();
    await expect(storageStatePage.getByText(testProduct.name)).toBeVisible();
  });

});

// ── randomString + timestamp fixtures ────────────────────────────────────────

test.describe('Utility fixtures', () => {

  test('can create uniquely-named items using randomString', async ({
    storageStatePage,
    randomString,
  }) => {
    // Call randomString() as many times as you need within one test
    const tagName1 = `tag-${randomString(4)}`;
    const tagName2 = `tag-${randomString(4)}`;

    await storageStatePage.goto('/tags/new');
    await storageStatePage.getByLabel('Tag Name').fill(tagName1);
    await storageStatePage.getByRole('button', { name: /add tag/i }).click();

    await expect(storageStatePage.getByText(tagName1)).toBeVisible();
    // tagName1 !== tagName2 guaranteed — no collision
  });

  test('uses timestamp for unique report names', async ({
    storageStatePage,
    timestamp,
  }) => {
    const reportName = `Automated Report ${timestamp}`;

    await storageStatePage.goto('/reports/new');
    await storageStatePage.getByLabel('Report Name').fill(reportName);
    await storageStatePage.getByRole('button', { name: /generate/i }).click();

    await expect(storageStatePage.getByText(reportName)).toBeVisible();
  });

});

// ── Combining multiple data fixtures in one test ──────────────────────────────

test.describe('Combined fixture usage', () => {

  test('creates a user and assigns a product — full integration', async ({
    authedApiClient,
    storageStatePage,
    testUser,
    testProduct,
  }) => {
    // Setup: create user + product via API
    const userRes = await authedApiClient.post('/users', { data: testUser });
    const { id: userId } = await userRes.json();

    const productRes = await authedApiClient.post('/products', { data: testProduct });
    const { id: productId } = await productRes.json();

    // Assign product to user via API
    await authedApiClient.post(`/users/${userId}/products`, {
      data: { productId },
    });

    // Verify in UI
    await storageStatePage.goto(`/users/${userId}`);
    await expect(storageStatePage.getByText(testProduct.name)).toBeVisible();
  });

});
