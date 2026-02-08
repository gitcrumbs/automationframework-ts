Run all tests (headless) : npx playwright test

Run all tests (headed / show browser) : npx playwright test --headed

Run only Chromium (Chrome engine) : npx playwright test --project=chromium

Chromium + headed + single browser (DEV MODE) : npx playwright test --project=chromium --headed --workers=1

Run a specific test file : npx playwright test tests/login.spec.ts

Run a single test by name : npx playwright test -g "login test"

Debug mode (Inspector + step-through) : npx playwright test --debug

Execute with logger On : npm run test:debug

Debug a specific test in Chromium : npx playwright test tests/login.spec.ts --project=chromium --debug

UI Mode (visual test runner) : npx playwright test --ui

List all discovered tests : npx playwright test --list

Run failed tests from last run : npx playwright test --last-failed

Override workers count : npx playwright test --workers=1

Generate HTML report : npx playwright test --reporter=html

Open last HTML report : npx playwright show-report

Show a Playwright trace : npx playwright show-trace trace.zip

CI safety (fail if test.only exists) : npx playwright test --forbid-only

Local dev (stable + visible) : npx playwright test --project=chromium --headed --workers=1

Quick debug (single test) : npx playwright test tests/login.spec.ts --project=chromium --debug

CI run : npx playwright test --forbid-only
