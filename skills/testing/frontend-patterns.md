> Part of the `testing` skill (see `SKILL.md`).

# Frontend patterns

Testing UI so the tests resemble how a user actually uses the software — that resemblance is what gives them confidence.

## The Testing Trophy

For UI code, integration tests are the sweet spot — *"Write tests. Not too many. Mostly integration."* A component rendered with its real children and wired-up state, exercised through user actions, catches the bugs that matter without the cost and flakiness of full E2E. Keep a base of fast unit tests for pure logic, a strong middle of integration tests, and few E2E tests on critical flows.

Guiding rule: **the more your tests resemble the way your software is used, the more confidence they give you.** Drive tests by what the user sees and does, not by component internals.

## User-centric queries

Find elements the way a user (or assistive technology) would, not by implementation detail. Preference order:

1. **By role + accessible name** — `getByRole('button', { name: 'Submit' })`. Most resilient; also asserts accessibility.
2. **By label** — `getByLabel('Password')` for form fields.
3. **By text / placeholder / alt text** — visible content.
4. **By test id** — `getByTestId('checkout-total')`, a last-resort explicit contract when there is no semantic handle.
5. **CSS/XPath selectors** — avoid; they break on markup refactors and test structure, not behavior.

Querying by role and label doubles as an accessibility check: if the test can't find the control by its accessible name, neither can a screen reader.

## Assert behavior, not implementation

Assert "the user sees the order confirmed", not "the `.order-status` div has class `.done`". Tests coupled to markup/CSS/internal state break on refactors that change nothing the user experiences. This keeps the suite from being a tax on every UI tweak.

## Mock at the network boundary

Mock HTTP where the app meets the network (MSW-style request interception), not by stubbing your own fetch functions or components. The app runs its real data-fetching code; only the server is faked.

- **Why the boundary** — you exercise the actual request/response wiring and can reuse the same mocks across unit, integration, and E2E.
- **Force hard states** — return `500`, an empty list, or a slow/timed-out response to test error and empty UI states the real backend rarely produces on demand.
- **Keep it deterministic** — no live network means no latency-driven flakiness.

## Component testing

Test a component in isolation with its real rendering. Prefer rendering in a **real browser** (via a browser-based component runner) over a simulated DOM when CSS, layout, focus, or real events matter — a fake DOM won't reproduce them. The trade-off is speed; use the simulated DOM for pure-logic components and the real browser for interaction- and visual-heavy ones. Combine with network-boundary mocking for components that fetch. (For the browser-based approach, see `playwright.md`.)

## Async assertions — never sleep

UI updates arrive asynchronously. Assert with auto-retrying / polling matchers (`await expect(...).toBeVisible()`, `findBy*`, `waitFor`) that retry until the condition holds or a timeout fires. Never wait a fixed number of milliseconds — an arbitrary sleep is either too short (flaky) or too long (slow), and reads state only once instead of waiting for the real condition.
