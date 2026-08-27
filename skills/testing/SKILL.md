---
name: testing
description: Self-contained reference for how to test software well — the test pyramid, F.I.R.S.T., Arrange-Act-Assert, the single-act rule, testing behavior through public interfaces, deterministic tests, and treating test code as first-class. Use when planning a feature, implementing code, writing or reviewing tests, or when asking "what should I test", "how should I test this", or "what's the test strategy". Routes to sibling files for backend, frontend, Playwright/E2E, and acceptance/BDD detail.
---

# Testing

Tests are a design tool, not a tax. If something is hard to test, it is usually hard to maintain — the friction is telling you the design is wrong. Apply these principles on every change; load a sibling file when you need depth on a specific area.

## Core principles (always true)

**Pyramid shape.** Many fast unit tests at the base, fewer integration tests in the middle, few E2E tests at the top (~70/20/10 as a shape, not a quota). Maximize fast tests; minimize slow, brittle ones.

**F.I.R.S.T.** Every test is Fast, Isolated, Repeatable, Self-validating, Timely. Each property removes a reason not to run the suite — and a suite nobody runs protects nobody.

**Arrange-Act-Assert.** Structure every test in three phases: set up the world (Arrange / Given), perform one operation (Act / When), verify the outcome (Assert / Then). Keep Arrange minimal; never hide side effects inside an assertion.

**Name the SUT.** Call the thing under test `sut`. Everything else (repositories, collaborators, clocks) is a dependency. A reader scanning the test then knows instantly what is being exercised.

**One Act per test (single-act rule).** A test performs exactly one action. Avoid `arrange → act → assert → act → assert` — that is two tests fused into one, and when it fails it cannot tell you which action broke. If the test name contains "and" (saves **and** sends **and** returns), split it. Multiple assertions are fine when they verify one logical fact; multiple Acts are not.

**Test behavior through public interfaces.** Assert on observable outcomes, not internal mechanics. Tests coupled to implementation break on refactors that change nothing a user can see. Low coupling to production detail means one requirement change touches the fewest tests.

**Deterministic.** Same code → same result, on any machine, in any order. Eliminate hidden inputs: clocks, randomness, network, filesystem, shared state, test ordering.

**Tests are first-class code — the system's low-level documentation.** Test code is refactored, named, and designed with the same care as production code, because it grows alongside production and rots faster when neglected. A clean suite is a living, executable specification: it shows how the APIs are used, runs, and cannot silently go stale (if it drifts, it breaks). Dirty tests are worse than no tests — they become a liability the team eventually abandons, and then the production code owns the team.

## Navigation

| You are… | Read |
|---|---|
| Testing use cases, services, domain logic, repositories | `fundamentals.md`, then `backend-patterns.md` |
| Testing UI components, frontend logic | `fundamentals.md`, then `frontend-patterns.md` |
| Writing browser E2E / Playwright tests | `frontend-patterns.md`, then `playwright.md` |
| Defining acceptance criteria, BDD scenarios, a test DSL | `acceptance-bdd.md` |
| Reviewing tests for quality | `fundamentals.md` + the relevant area file |

- `fundamentals.md` — pyramid, F.I.R.S.T., AAA, SUT, single-act, determinism, tests as first-class code.
- `backend-patterns.md` — in-memory repository fakes, Mother Object / test data factories, Either/Result testing, dependency inversion for testability.
- `frontend-patterns.md` — Testing Trophy, user-centric queries, network-boundary mocking, component and async testing.
- `playwright.md` — locators, web-first assertions, storageState auth, Page Object Model, custom fixtures, network mocking, projects, trace debugging.
- `acceptance-bdd.md` — acceptance-testing discipline, Given/When/Then, test DSLs, and readability as the goal.
