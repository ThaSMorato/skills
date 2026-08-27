> Part of the `testing` skill (see `SKILL.md`).

# Playwright

Multi-browser E2E automation (Chromium, Firefox, WebKit) with auto-wait, web-first assertions, and full per-context isolation. Sits at the top of the pyramid: few tests, on critical flows, far less flaky than the previous generation of tools — **if** you follow the rules below.

## Locators & web-first assertions

A **locator** is a lazy query that re-resolves on each use and carries auto-wait + actionability. A **web-first assertion** is `expect(locator)` that **retries** until the condition holds. Together they replace `sleep`: you declare *what*, Playwright waits for *when*.

Prefer user-facing locators, in this order: `getByRole('button', { name: 'Submit' })` → `getByLabel('Password')` → `getByText` / `getByPlaceholder` / `getByAltText` → `getByTestId('...')` (last resort) → CSS/XPath (avoid — brittle to markup).

Before acting, Playwright waits for the element to be visible, stable (no animation), enabled, and receiving events; if it never becomes actionable it fails with a `TimeoutError`, not a phantom click.

```
await page.getByLabel('User').fill('ana')
await page.getByRole('button', { name: 'Sign in' }).click()

await expect(page.getByText('Order confirmed')).toBeVisible()   // retries — correct
expect(await page.getByText('Order confirmed').isVisible()).toBe(true)  // reads once — flaky
```

**Rule:** always `await expect(locator)…`; never `expect(await locator.someGetter())`. Never `waitForTimeout`. Never `force: true` to paper over flakiness — it masks a real actionability problem.

## Authentication via storageState

Don't log in through the UI in every test. Log in **once**, save the session state (`storageState` = cookies + localStorage) to a JSON file, and reuse it so every test starts authenticated.

```
// auth.setup.ts
setup('authenticate', async ({ page }) => {
  await page.goto('/login')
  await page.getByLabel('User').fill('user')
  await page.getByLabel('Password').fill('password')
  await page.getByRole('button', { name: 'Sign in' }).click()
  await page.waitForURL('/dashboard')                 // wait for login to complete, not a sleep
  await page.context().storageState({ path: 'playwright/.auth/user.json' })
})
```
```
// playwright.config.ts
projects: [
  { name: 'setup', testMatch: /auth\.setup\.ts/ },
  { name: 'chromium',
    use: { ...devices['Desktop Chrome'], storageState: 'playwright/.auth/user.json' },
    dependencies: ['setup'] },                          // setup runs first
]
```

- **Multiple roles** — write one JSON per role in setup; apply per test/block with `test.use({ storageState: '…/admin.json' })`. For two users in one test (chat, permissions), open separate `browser.newContext(...)`.
- **Tests that mutate server state** — use a per-worker fixture that authenticates a unique account once per worker (keyed by `parallelIndex`) so parallel tests don't fight over one account.
- **Never commit** the `.auth` JSONs — gitignore `playwright/.auth/` (they hold live sessions). `storageState` expires; re-authenticate in setup each run if sessions are short. Prefer seeding users via API/DB; use the UI only to validate the logged-in experience.

## Page Object Model

Encapsulate a screen in a class that exposes **business actions** (`login()`, `addToCart()`) and hides locators. Change the DOM → change one class, not twenty tests.

```
export class LoginPage {
  constructor(private page: Page) {}
  async goto() { await this.page.goto('/login') }
  async login(user, pass) {
    await this.page.getByLabel('User').fill(user)
    await this.page.getByLabel('Password').fill(pass)
    await this.page.getByRole('button', { name: 'Sign in' }).click()
  }
}
```

Methods are user actions (the name conveys intent), not 1:1 locator wrappers. **Assertions live in the test, not the page object** — the class acts, the test verifies (Command-Query separation). One object per cohesive screen/component; expose locators only when a test must assert on them.

## Custom fixtures (`test.extend`)

A **fixture** is a resource Playwright builds on demand, injects into a test by name, and tears down afterward. `test.extend` defines your own — the idiomatic replacement for `beforeEach`/`afterEach`.

```
export const test = base.extend<{ loginPage: LoginPage }>({
  loginPage: async ({ page }, use) => {
    const loginPage = new LoginPage(page)   // setup
    await loginPage.goto()
    await use(loginPage)                     // hand to the test
    // teardown runs here, after the test
  },
})
```
```
test('logs in', async ({ loginPage }) => { await loginPage.login('ana', 'secret') })
```

Fixtures are **lazy** (built only if requested), **composable** (one fixture uses another; the graph resolves itself), **explicit** (the test declares its needs in the signature), and leak-free (teardown bound to the fixture). Scope is `test` (default, max isolation) or `worker` (once per worker, for expensive/shared resources). The idiomatic pattern is to deliver Page Objects **through** a fixture.

## Network mocking (`page.route`)

`page.route(url, handler)` intercepts matching requests so you can fulfill (fake), modify, or abort the response — isolating the UI from a slow/unstable backend and forcing hard states deterministically.

```
await page.route('*/**/api/v1/fruits', route => route.fulfill({ json: [{ name: 'Strawberry', id: 21 }] }))
```

- **Modify the real response** — `route.fetch()`, edit the body, then `route.fulfill({ response, json })`.
- **Force failure** — `route.fulfill({ status: 500 })` or `route.abort()` to test error paths.
- **Glob/regex patterns** — `'*/**/api/**'` matches any host/prefix. `page.routeFromHAR(...)` records/replays real traffic.
- **Don't over-mock true critical-path E2E** — mocking everything turns E2E into a frontend integration test and loses the "whole system works" confidence. Keep the real happy path real; mock the error branches.

## Projects & setup dependencies

A **project** is a named run config (a browser, a device, a `storageState`, a subset of tests). The config lists several and runs their matrix; `dependencies` chains them.

```
projects: [
  { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
  { name: 'firefox',  use: { ...devices['Desktop Firefox'] } },
  { name: 'mobile',   use: { ...devices['iPhone 15'] } },   // same tests, cross-browser
]
```

- **`dependencies: ['setup']`** — a setup project runs before dependent projects (authenticate + write storageState, seed a DB, prepare data); its inverse `teardown` cleans up after.
- **Setup project vs `globalSetup`** — `globalSetup` is a plain function running once outside the runner (good for infra), with no trace/fixtures/report. A setup **project** is a real test — it has trace, retry, fixtures, and shows in the report — preferred for login/seed because it's observable when it fails.
- **Config that fights flakiness** — `use.baseURL` (relative `goto`, swap environments without editing tests); `retries: 2` on CI + `trace: 'on-first-retry'`; `fullyParallel: true` (pairs with per-worker auth when tests mutate state); `webServer` to boot the app and wait for its port.

## Trace Viewer & debugging

When an E2E test fails — especially on CI where you can't see the screen — the **Trace Viewer** is the answer: a step-by-step record with before/after DOM snapshots, screenshots, network, and console for each action. You go back in time and see exactly what the page looked like before the click that broke.

```
use: { trace: 'on-first-retry' }        // record only when a test retries (recommended for CI)
npx playwright show-trace trace.zip
```

- **UI Mode** (`npx playwright test --ui`) — visual watch mode; run test by test, inspect the timeline, edit a locator and see the result live. Best place to write new tests and hunt flakiness.
- **Inspector** (`npx playwright test --debug` or `await page.pause()`) — pause, step, live-locator picker.
- **Practical flow** — download `trace.zip` from the CI artifact → `show-trace` → find the action that failed and inspect the DOM snapshot *before* it (did the element exist? was it covered?) → reproduce locally in UI Mode → fix the locator or the wait.
- `console.log` is useless in E2E: test code runs in Node, the page in the browser. Trace/UI Mode are how you see what happened *on the page*.
