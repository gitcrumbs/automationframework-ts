/**
 * playwright.config.ts  (updated for fixtures folder)
 * ─────────────────────────────────────────────────────────────────────────────
 * Key additions vs your original config:
 *  1. globalSetup  → runs globalSetup.ts once before all tests (saves auth session)
 *  2. storageState → ignored here; handled per-fixture in auth.fixture.ts
 *  3. trace/video  → enabled on retry so Trace Viewer captures failures
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { defineConfig, devices } from '@playwright/test';
import * as dotenv from 'dotenv';

// Load .env file values into process.env
dotenv.config();

export default defineConfig({

  // ── Global setup (runs once before all tests) ──────────────────────────────
  // This logs in and saves .auth/session.json for the auth.fixture to use.
  globalSetup: require.resolve('./fixtures/globalSetup'),

  // ── Test discovery ─────────────────────────────────────────────────────────
  testDir: './tests',
  testMatch: ['**/*.spec.ts'],

  // ── Parallelism ────────────────────────────────────────────────────────────
  fullyParallel: true,
  workers: process.env.CI ? '50%' : 4,

  // ── Retry policy ──────────────────────────────────────────────────────────
  retries: process.env.CI ? 2 : 0,

  // ── Reporter ───────────────────────────────────────────────────────────────
  reporter: [
    ['html', { outputFolder: 'playwright-report', open: 'never' }],
    ['list'],                   // Clean CI output per test
    ['junit', { outputFile: 'test-results/junit.xml' }], // For CI integrations
  ],

  // ── Shared test settings ───────────────────────────────────────────────────
  use: {
    baseURL: process.env.BASE_URL ?? 'http://localhost:3000',

    // Capture trace on first retry — opens in Trace Viewer for debugging
    trace: 'on-first-retry',

    // Record video on first retry
    video: 'on-first-retry',

    // Screenshot on failure
    screenshot: 'only-on-failure',

    // Global timeout for each action (click, fill, etc.)
    actionTimeout: 15_000,

    // Ignore HTTPS errors in dev/staging
    ignoreHTTPSErrors: true,
  },

  // ── Output directories ─────────────────────────────────────────────────────
  outputDir:        'test-results',
  snapshotPathTemplate: 'snapshots/{testFilePath}/{arg}{ext}',

  // ── Global timeouts ────────────────────────────────────────────────────────
  timeout: 60_000,         // Per-test timeout
  expect: {
    timeout: 10_000,       // Per-assertion timeout
  },

  // ── Browser projects ───────────────────────────────────────────────────────
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
    {
      name: 'mobile-chrome',
      use: { ...devices['Pixel 7'] },
    },
    {
      name: 'mobile-safari',
      use: { ...devices['iPhone 14'] },
    },
  ],
});
