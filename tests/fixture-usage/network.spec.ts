/**
 * network.spec.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * Demonstrates usage of network fixtures:
 *   - mockNetwork    (stub API responses with custom status/body)
 *   - blockAnalytics (abort tracking requests)
 *   - networkLogs    (assert which APIs were called and how)
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { test, expect } from '../../fixtures';

// ── Mocking API responses ─────────────────────────────────────────────────────

test.describe('Error state handling (via mockNetwork)', () => {

  test('shows empty state when API returns no results', async ({ page, mockNetwork }) => {
    // Intercept the products API and return empty array before navigating
    await mockNetwork(page, '/api/products', 200, { items: [], total: 0 });

    await page.goto('/products');
    await expect(page.getByText('No products found')).toBeVisible();
  });

  test('shows error banner when API returns 500', async ({ page, mockNetwork }) => {
    await mockNetwork(page, '/api/dashboard/stats', 500, {
      error: 'Internal Server Error',
    });

    await page.goto('/dashboard');
    await expect(page.getByRole('alert')).toBeVisible();
    await expect(page.getByText(/something went wrong/i)).toBeVisible();
  });

  test('shows unauthorized message on 401', async ({ page, mockNetwork }) => {
    await mockNetwork(page, '/api/admin/**', 401, { message: 'Unauthorized' });

    await page.goto('/admin');
    await expect(page.getByText(/you do not have access/i)).toBeVisible();
  });

  test('handles slow network — shows loading spinner', async ({ page }) => {
    // Delay the API response by 2 seconds to test loading state
    await page.route('/api/reports', async (route) => {
      await new Promise((resolve) => setTimeout(resolve, 2000));
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ data: [] }),
      });
    });

    await page.goto('/reports');
    // Spinner should be visible during the delay
    await expect(page.getByTestId('loading-spinner')).toBeVisible();
    // Then disappear once data loads
    await expect(page.getByTestId('loading-spinner')).toBeHidden({ timeout: 5000 });
  });

});

// ── Asserting network calls with networkLogs ──────────────────────────────────

test.describe('Network call assertions (via networkLogs)', () => {

  test('clicking Pay triggers POST to /api/payment', async ({
    page,
    networkLogs,
    storageStatePage,
  }) => {
    await storageStatePage.goto('/checkout');
    await storageStatePage.getByRole('button', { name: /pay now/i }).click();

    // Wait briefly for the network request to fire
    await storageStatePage.waitForTimeout(500);

    const paymentRequest = networkLogs.find((r) =>
      r.url().includes('/api/payment') && r.method() === 'POST'
    );

    expect(paymentRequest).toBeDefined();
    expect(paymentRequest?.method()).toBe('POST');
  });

  test('search input debounces — only one API call per query', async ({
    page,
    networkLogs,
  }) => {
    await page.goto('/search');
    const searchInput = page.getByRole('searchbox');

    // Type quickly — debounce should collapse to one API call
    await searchInput.pressSequentially('playwright', { delay: 50 });
    await page.waitForTimeout(800); // wait for debounce to settle

    const searchCalls = networkLogs.filter((r) => r.url().includes('/api/search'));
    expect(searchCalls.length).toBe(1);
  });

});
