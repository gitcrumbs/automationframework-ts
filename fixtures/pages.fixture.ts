/**
 * pages.fixture.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * Wires all Page Object classes into the Playwright fixture system.
 * This is the glue between your pages/ folder and your tests/ folder.
 *
 * Instead of doing this in every test:
 *   const loginPage = new LoginPage(page);
 *   const dashboard = new DashboardPage(page);
 *
 * You simply declare what you need:
 *   test('...', async ({ loginPage, dashboardPage }) => { ... });
 *
 * Adding a new page object is ONE step: add it below and export it.
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { test as base, Page } from '@playwright/test';

// ── Import your Page Objects ─────────────────────────────────────────────────
// These map to your existing pages/ folder structure.
// Add new Page Object imports here as your suite grows.

import { LandingPage } from '../pages/LandingPage/LandingPage';

// Uncomment as you create these:
// import { LoginPage }    from '../pages/LoginPage/LoginPage';
// import { DashboardPage } from '../pages/DashboardPage/DashboardPage';
// import { ProfilePage }   from '../pages/ProfilePage/ProfilePage';

// ── Types ────────────────────────────────────────────────────────────────────

export type PageFixtures = {
  landingPage:   LandingPage;
  // loginPage:    LoginPage;
  // dashboardPage: DashboardPage;
  // profilePage:   ProfilePage;
};

// ── Fixture Extension ────────────────────────────────────────────────────────

export const test = base.extend<PageFixtures>({

  /**
   * landingPage
   * ───────────
   * Instantiates LandingPage with the current test's page object.
   * Playwright handles page lifecycle — you don't need to create/destroy it.
   */
  landingPage: async ({ page }, use) => {
    await use(new LandingPage(page));
  },

  // Uncomment and duplicate this pattern for each new Page Object:
  //
  // loginPage: async ({ page }, use) => {
  //   await use(new LoginPage(page));
  // },
  //
  // dashboardPage: async ({ page }, use) => {
  //   await use(new DashboardPage(page));
  // },
  //
  // profilePage: async ({ page }, use) => {
  //   await use(new ProfilePage(page));
  // },
});

export { expect } from '@playwright/test';
