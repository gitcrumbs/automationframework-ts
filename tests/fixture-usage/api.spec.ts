/**
 * api.spec.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * Demonstrates usage of api fixtures:
 *   - apiClient      (unauthenticated — public endpoints)
 *   - authedApiClient (authenticated — protected endpoints)
 *
 * Key pattern: Use API to SET UP state, then verify it in the UI.
 * This is much faster than driving setup through the UI itself.
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { test, expect } from '../../fixtures';

// ── Pure API tests (no browser needed) ───────────────────────────────────────

test.describe('Public API endpoints', () => {

  test('GET /health returns 200', async ({ apiClient }) => {
    const response = await apiClient.get('/health');
    expect(response.status()).toBe(200);

    const body = await response.json();
    expect(body).toMatchObject({ status: 'ok' });
  });

  test('POST /login with invalid credentials returns 401', async ({ apiClient }) => {
    const response = await apiClient.post('/auth/login', {
      data: { email: 'wrong@example.com', password: 'bad' },
    });
    expect(response.status()).toBe(401);
  });

});

// ── Authenticated API tests ───────────────────────────────────────────────────

test.describe('Protected API endpoints', () => {

  test('GET /users returns user list for authenticated user', async ({ authedApiClient }) => {
    const response = await authedApiClient.get('/users');
    expect(response.status()).toBe(200);

    const body = await response.json();
    expect(Array.isArray(body.users)).toBe(true);
    expect(body.users.length).toBeGreaterThan(0);
  });

  test('POST /users creates a new user', async ({ authedApiClient }) => {
    const response = await authedApiClient.post('/users', {
      data: {
        name:  'Ashwani Singh',
        email: 'ashwani.test@qa.example.com',
        role:  'editor',
      },
    });
    expect(response.status()).toBe(201);

    const created = await response.json();
    expect(created).toMatchObject({ name: 'Ashwani Singh' });
    expect(created.id).toBeDefined();
  });

});

// ── API + UI combined test ────────────────────────────────────────────────────
// Best pattern: set up state via API (fast), verify via UI (realistic)

test.describe('API setup → UI verification', () => {

  test('user created via API appears in UI user list', async ({
    authedApiClient,
    storageStatePage, // UI page, already authenticated
  }) => {
    // ── SETUP: Create user via API (instant, no UI clicks) ──────────────────
    const createRes = await authedApiClient.post('/users', {
      data: {
        name:  'UI Verify User',
        email: `ui.verify.${Date.now()}@qa.example.com`,
        role:  'viewer',
      },
    });
    expect(createRes.status()).toBe(201);
    const { name } = await createRes.json();

    // ── VERIFY: Check the UI reflects the new user ───────────────────────────
    await storageStatePage.goto('/users');
    await storageStatePage.waitForLoadState('networkidle');
    await expect(storageStatePage.getByText(name)).toBeVisible();
  });

});
