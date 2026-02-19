/**
 * auth.spec.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * Demonstrates usage of auth fixtures:
 *   - storageStatePage  (fast session restore)
 *   - freshLoginPage    (real login per test)
 *   - authenticatedContext (multi-tab scenarios)
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { test, expect } from '../../fixtures';

// ── Using storageStatePage ────────────────────────────────────────────────────
// The session is loaded from .auth/session.json — no login round-trip.
// Use this for 95% of your tests.

test.describe('Dashboard (authenticated via session restore)', () => {

  test('redirects to dashboard after session load', async ({ storageStatePage }) => {
    // storageStatePage is already authenticated and at BASE_URL
    await expect(storageStatePage).toHaveURL(/.*dashboard/);
  });

  test('shows user avatar in nav when logged in', async ({ storageStatePage }) => {
    const avatar = storageStatePage.getByTestId('user-avatar');
    await expect(avatar).toBeVisible();
  });

  test('shows correct username in header', async ({ storageStatePage }) => {
    const header = storageStatePage.getByRole('banner');
    await expect(header).toContainText('admin@example.com');
  });

});

// ── Using freshLoginPage ──────────────────────────────────────────────────────
// Does a real login before each test. Use when testing auth flows directly.

test.describe('Login flow (fresh login per test)', () => {

  test('login with valid credentials lands on dashboard', async ({ freshLoginPage }) => {
    // freshLoginPage has already logged in — we verify the result
    await expect(freshLoginPage).toHaveURL(/.*dashboard/);
    await expect(freshLoginPage.getByRole('heading', { name: /dashboard/i })).toBeVisible();
  });

  test('user can log out after fresh login', async ({ freshLoginPage }) => {
    await freshLoginPage.getByRole('button', { name: /logout/i }).click();
    await expect(freshLoginPage).toHaveURL(/.*login/);
  });

});

// ── Using authenticatedContext ────────────────────────────────────────────────
// For multi-tab or multi-window scenarios.

test.describe('Multi-tab (authenticated context)', () => {

  test('can open new tab within the same session', async ({ authenticatedContext }) => {
    const page1 = await authenticatedContext.newPage();
    const page2 = await authenticatedContext.newPage();

    await page1.goto('/dashboard');
    await page2.goto('/settings');

    // Both tabs share the same authenticated session
    await expect(page1.getByRole('heading', { name: /dashboard/i })).toBeVisible();
    await expect(page2.getByRole('heading', { name: /settings/i })).toBeVisible();

    await page1.close();
    await page2.close();
  });

});
