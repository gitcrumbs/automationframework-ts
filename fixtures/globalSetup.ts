/**
 * globalSetup.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * Runs ONCE before all tests start (not once per test).
 *
 * Purpose: Log in via the UI and save the browser's storage state (cookies +
 * localStorage) to disk at .auth/session.json. The auth.fixture then loads
 * this saved session for every test that uses `storageStatePage`, meaning your
 * tests never need to re-login — they just restore the session instantly.
 *
 * Register this in playwright.config.ts:
 *   globalSetup: require.resolve('./globalSetup')
 *
 * How it works:
 *  1. globalSetup runs → logs in → saves .auth/session.json
 *  2. Each test worker restores session from that file
 *  3. Tests run authenticated without touching the login page
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { chromium, FullConfig } from '@playwright/test';
import path from 'path';
import fs from 'fs';

async function globalSetup(config: FullConfig): Promise<void> {
  const { baseURL } = config.projects[0].use;

  const authDir     = path.resolve(__dirname, '.auth');
  const sessionFile = path.join(authDir, 'session.json');

  // Ensure .auth directory exists
  if (!fs.existsSync(authDir)) {
    fs.mkdirSync(authDir, { recursive: true });
  }

  const browser = await chromium.launch();
  const context = await browser.newContext();
  const page    = await context.newPage();

  console.log('🔐 Global setup: logging in to save session...');

  // ── Perform login ──────────────────────────────────────────────────────────
  await page.goto(`${baseURL}/login`);
  await page.getByLabel('Email').fill(process.env.TEST_USER ?? 'admin@example.com');
  await page.getByLabel('Password').fill(process.env.TEST_PASS ?? 'password123');
  await page.getByRole('button', { name: /log in/i }).click();
  await page.waitForURL('**/dashboard');
  // ──────────────────────────────────────────────────────────────────────────

  // Save the authenticated state (cookies + localStorage) to disk
  await context.storageState({ path: sessionFile });
  console.log(`✅ Session saved to ${sessionFile}`);

  await browser.close();
}

export default globalSetup;
