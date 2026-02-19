/**
 * fixtures/index.ts  ← The single import point for ALL your tests
 * ─────────────────────────────────────────────────────────────────────────────
 * This file merges every individual fixture file into one unified `test` object.
 *
 * In your tests, ALWAYS import from here instead of @playwright/test:
 *
 *   ✅  import { test, expect } from '../fixtures';
 *   ❌  import { test, expect } from '@playwright/test';
 *
 * Doing this gives every test access to ALL fixtures (auth, api, pages,
 * network, data) with zero extra imports.
 *
 * Adding a new fixture:
 *  1. Create fixtures/yourThing.fixture.ts  (extend `latestTest` as base)
 *  2. Import it here and merge: const latestTest = previousTest.extend<...>({})
 *  3. Done — all tests immediately have access to the new fixture.
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { mergeTests } from '@playwright/test';

import { test as authTest }    from './auth.fixture';
import { test as apiTest }     from './api.fixture';
import { test as pagesTest }   from './pages.fixture';
import { test as networkTest } from './network.fixture';
import { test as dataTest }    from './data.fixture';

/**
 * The merged test object.
 * All fixture types are unioned — TypeScript knows about every fixture
 * property and will autocomplete them in your IDE.
 */
export const test = mergeTests(
  authTest,
  apiTest,
  pagesTest,
  networkTest,
  dataTest,
);

// Re-export expect so tests only need one import line
export { expect } from '@playwright/test';
