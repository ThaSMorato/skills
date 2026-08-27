> Part of the `testing` skill (see `SKILL.md`).

# Acceptance testing, BDD & test DSLs

Turning requirements into executable, business-readable tests — and making every test read like a specification.

## Acceptance-testing discipline

Acceptance tests express **requirements as tests**: a feature is "done" when its automated acceptance tests pass. They pin down what the system must do in terms the business can read, and remove the ambiguity of prose requirements.

- **Requirements become executable.** Each requirement is captured as a test, so "the requirement" and "the check that it's met" are the same artifact — it cannot silently drift.
- **Ownership.** The business/product side owns the **happy-path** criteria (what success looks like); engineering owns the **edge cases and failure modes** (empty, invalid, concurrent, timeout). Both are automated.
- **Business-readable language.** Write acceptance tests in a language stakeholders can read and confirm (see Given/When/Then below), so they validate behavior without reading code.
- **Definition of done.** Passing acceptance tests are part of the definition of done, not a later phase. A feature isn't finished until its acceptance criteria are green.
- **Continuous build.** Acceptance tests run in the continuous build alongside unit and integration tests, so a regression in agreed behavior breaks the build immediately.

## BDD — Given / When / Then

Behavior-Driven Development describes expected behavior in structured natural language, bringing business and code closer. It is TDD focused on observable behavior and the ubiquitous language of the domain.

- **Given** a context, **When** an action occurs, **Then** an expected outcome follows.
- Scenarios are readable by non-technical stakeholders yet execute as tests (via a Gherkin runner).
- **TDD vs BDD** — TDD drives the unit and internal design; BDD drives observable behavior in the business's language. They complement rather than compete.

```
Scenario: Withdraw within balance
  Given an account with balance 100
  When the customer withdraws 30
  Then the balance is 70
  And the withdrawal is approved
```

Keep each scenario to one behavior — the "and" in `Then` describes one outcome, not a second `When`. Multiple `When` steps are the single-act smell in Gherkin form; split the scenario.

## Test DSLs at the acceptance level

A **test DSL** — intention-revealing helpers that make a test read like a spec — is a fundamental of clean tests, treated in full in `fundamentals.md` (it is the main refactor move after green, at every level, and it is where Object Mother + Builder, composed assertions, and composed results are defined). At the acceptance level the DSL becomes *business-readable*: the Given/When/Then above is itself a DSL a stakeholder can read, and the same emergent refactoring applies — push request-building, wiring, and response-casting noise into helpers named in the domain's language so the scenario states behavior, not mechanics.

## Readability is the goal

Everything above serves one end: a test that reads like a specification. Readability in tests matters even more than in production code, because the suite is read as the living documentation of what the system does. Clarity, simplicity, and density of expression are what make a test readable — the same qualities that make any code readable. An unreadable test loses its double value (verify + document), rots, and gets abandoned. Invest in the DSL and the naming so that the next reader learns the system's behavior by reading its tests.
