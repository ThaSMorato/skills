> Part of the `testing` skill (see `SKILL.md`).

# Frontend patterns

Testing UI so the tests resemble how a user actually uses the software — that resemblance is what gives them confidence.

## The Testing Trophy

For UI code, integration tests are the sweet spot — *"Write tests. Not too many. Mostly integration."* A component rendered with its real children and wired-up state, exercised through user actions, catches the bugs that matter without the cost and flakiness of full E2E. Beneath all of it sits a **static** layer — the type checker and the linter, always on — which catches a class of bugs no test needs to be written for. Keep a base of fast unit tests for pure logic, a strong middle of integration tests, and few E2E tests on critical flows.

Guiding rule: **the more your tests resemble the way your software is used, the more confidence they give you.** Drive tests by what the user sees and does, not by component internals.

## User-centric queries

Find elements the way a user (or assistive technology) would, not by implementation detail. Preference order:

1. **By role + accessible name** — `getByRole('button', { name: 'Submit' })`. Most resilient; also asserts accessibility.
2. **By label** — `getByLabel('Password')` for form fields.
3. **By text / placeholder / alt text** — visible content.
4. **By test id** — `getByTestId('checkout-total')`, a last-resort explicit contract when there is no semantic handle.
5. **CSS/XPath selectors** — avoid; they break on markup refactors and test structure, not behavior.

Querying by role and label doubles as an accessibility check: if the test can't find the control by its accessible name, neither can a screen reader.

**Asserting absence:** a `get*` query throws when nothing matches, so it cannot say "not there". Use the `query*` form, which returns empty: `expect(screen.queryByRole('alert')).not.toBeInTheDocument()`.

## Assert behavior, not implementation

Assert "the user sees the order confirmed", not "the `.order-status` div has class `.done`". Tests coupled to markup/CSS/internal state break on refactors that change nothing the user experiences. This keeps the suite from being a tax on every UI tweak.

**Drive it like a user.** Simulate interactions with a user-event layer (`userEvent.type`, `userEvent.click`), which fires the whole browser chain — focus, key down, input, key up, change — not a single synthetic event (`fireEvent.change`), which skips the steps real handlers listen to.

## Mock at the network boundary

Mock HTTP where the app meets the network (MSW-style request interception), not by stubbing your own fetch functions or components. The app runs its real data-fetching code; only the server is faked.

- **Why the boundary** — you exercise the actual request/response wiring and can reuse the same mocks across unit, integration, and E2E.
- **Force hard states** — return `500`, an empty list, or a slow/timed-out response to test error and empty UI states the real backend rarely produces on demand.
- **Keep it deterministic** — no live network means no latency-driven flakiness.
- **Default handlers plus per-test overrides.** Register the happy-path handlers once for the suite, override one inside the test that needs a different answer (`server.use(...)` returning a `500`), and **reset the handlers after each test** so the override does not leak into the next.

## Component testing

Render the component **with its real children** (full mount, blackbox), not with its children mocked out (shallow, whitebox). Shallow rendering is for the rare, deeply nested tree; by default, catching the bugs between parent and child is the point.

- **Test:** what renders for given props, the DOM after user events, emitted events and callbacks, accessible elements, conditional rendering.
- **Don't test:** internal state variables, private methods, CSS class names, which hook or internal function was used.

Test a component in isolation with its real rendering. Prefer rendering in a **real browser** (via a browser-based component runner) over a simulated DOM when CSS, layout, focus, or real events matter — a fake DOM won't reproduce them. The trade-off is speed; use the simulated DOM for pure-logic components and the real browser for interaction- and visual-heavy ones. Combine with network-boundary mocking for components that fetch. (For the browser-based approach, see `playwright.md`.)

## Test DSL for components

The same test-DSL refactoring (see `fundamentals.md`) applies to UI tests — after green, push rendering and interaction noise into domain helpers:

- **Render helpers** — `renderWithProviders(<Checkout/>)` wraps the router/store/query-client setup so each test renders in one line.
- **Custom matchers** — `expect(el).toBeVisible()` / `toHaveAccessibleName(...)` (jest-dom-style) state the goal, not DOM mechanics.
- **User-flow helpers** — wrap a multi-step interaction behind one intention-revealing call (`await checkoutAs(user)`).
- **Prop mothers** — build component props with sensible defaults; the frontend form of the Mother Object.

## Async assertions — never sleep

UI updates arrive asynchronously. Assert with auto-retrying / polling matchers (`await expect(...).toBeVisible()`, `findBy*`, `waitFor`) that retry until the condition holds or a timeout fires. Never wait a fixed number of milliseconds — an arbitrary sleep is either too short (flaky) or too long (slow), and reads state only once instead of waiting for the real condition.

- **Test all three states** of anything that loads: loading (assert the indicator, then that it disappears), success, and error (override the network handler to fail).
- **Never put a side effect inside a retrying wait.** `waitFor` re-runs its callback until it passes, so a click inside it clicks N times. Act first, then wait on the assertion alone.

```
await userEvent.click(submit)                                   // act — once
await waitFor(() => expect(screen.getByText('Done')).toBeVisible())   // only the assertion retries
```

## Hooks and composables

| The hook… | Test it |
|---|---|
| has real logic (calculations, a state machine) | in isolation, with a hook-rendering helper (`renderHook`) |
| is a thin wrapper (just calls an API) | through a component that uses it |
| needs lifecycle or providers | inside a minimal host component |

Assert only its public API — the values and functions it returns — never its internal state.

## State management

- **A fresh store per test.** A store shared between tests is shared mutable state.
- **Reducers / mutations** are pure functions: test them directly, no framework.
- **Selectors / getters:** feed a known state, assert the computed value.
- **Actions / effects:** fake the external dependency, assert the resulting state change.
- **Component + store:** mount with a real store or a stub seeded with the state the test needs.

## Pages and routes

A page-level integration test renders the app at a route and checks what the user gets: the right components for the route, route params reaching the children, navigation updating the content, **guards redirecting** users who may not enter, and the loading → data → error cycle. Full mount — the interaction between parent and child is the point.

## Automated accessibility checks

Run an automated checker (axe or equivalent) in component tests and on key pages in E2E; fail on violations. It catches missing alt text, unlabeled inputs, insufficient contrast, missing roles and attributes, focus traps and broken heading order — roughly half of the WCAG issues. It does **not** catch logical tab order, the quality of what a screen reader announces, keyboard usability of complex widgets, or whether alternative text is meaningful: it is a baseline, not an audit.

## Anti-patterns

| Anti-pattern | Why it hurts | Fix |
|---|---|---|
| **Snapshot-only tests** | large diffs nobody reads, and a false sense of coverage | pair a snapshot with behavioral assertions, or drop it |
| **Mocking everything** | the test proves nothing about real behavior | mock at the network boundary, not your own modules |
| **Manual `act()` wrappers** | the testing library already wraps its interactions; extra wrappers hide real warnings | remove them |
