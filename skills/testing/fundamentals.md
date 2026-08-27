> Part of the `testing` skill (see `SKILL.md`).

# Fundamentals

The always-true mechanics of a good test, independent of language or framework.

## The Test Pyramid

Distribute testing effort by speed and cost. Many cheap tests at the base, few expensive ones at the top.

| Level | Tests | Speed | Isolation | Rough share |
|---|---|---|---|---|
| **Unit** | one function/class/use case, dependencies faked | milliseconds | full | ~70% |
| **Integration** | modules wired together (DB, HTTP, DI) — the "wiring" and boundaries | seconds | partial, may use a real DB | ~20% |
| **E2E** | the whole system from the user's perspective, everything real | seconds–minutes | none | ~10% |

The shape matters more than the exact numbers: maximize fast, deterministic tests; keep the slow, flaky ones few and reserved for critical flows. Integration tests catch what units miss — O/R mapping, transactions, contract mismatches. E2E gives the most confidence and the most flakiness; spend it only on critical paths. (Frontend shifts the sweet spot toward integration — see `frontend-patterns.md`.)

## F.I.R.S.T.

| Property | Meaning | If violated |
|---|---|---|
| **Fast** | runs in milliseconds | a slow suite is one nobody runs; problems surface late and expensive |
| **Isolated** | no test sets up the next; runs alone, in any order | shared state → cascading failures, can't parallelize |
| **Repeatable** | same result in any environment (prod, CI, a laptop offline) | environment-dependence becomes an excuse not to run it |
| **Self-validating** | boolean pass/fail, no manual log/file inspection | failure becomes subjective and costly to check |
| **Timely** | written with (or before) the production code | code written test-last is born hard to test |

Each property removes a source of friction or a lie. Together they keep the suite cheap to run and trustworthy — the only kind a team actually executes and trusts to decide on.

## Arrange-Act-Assert

Three phases, in order:

- **Arrange** — create the SUT, wire fake dependencies, seed data. Keep it to only what this test needs.
- **Act** — perform exactly one operation on the SUT.
- **Assert** — verify the outcome: return value, state change, or side effect. Never put a side effect here.

```
repository = InMemoryUsersRepository()          // Arrange
sut        = CreateUserUseCase(repository)
result     = sut.execute({ name: "Alice" })     // Act
expect(result.isRight()).toBe(true)             // Assert
expect(repository.items).toHaveLength(1)
```

## SUT — System Under Test

The SUT is the specific unit being exercised; everything else is a dependency. Naming the variable `sut` makes any test instantly scannable — the reader sees `sut` and knows *this is the thing being tested*, and `sut.execute(...)` is the one Act.

## Single responsibility & the single-act rule

Each test verifies **one behavior**, so its name alone tells you what broke.

- **Single logical assertion, not single line.** One test asserts one logical fact. If verifying that fact needs six assertions (e.g. six indicator lights that together represent one state), that is fine — they affirm one thing. When the result is that complex, compose it into a readable form (see **Test DSL** below).
- **Single Act is the rule that actually matters.** Test one action at a time. Avoid `arrange → act → assert → act → assert`. Each action is tested individually so a downstream assertion is never corrupted by an upstream action, and each test stands alone (this is the "Isolated" of F.I.R.S.T. in practice).
- **The "and" smell.** A test name with "and" (saves **and** sends **and** returns) hides multiple Acts → split into multiple tests. A multi-Act test fails without telling you which action broke; one Act per test gives a precise diagnosis — the red test's name points at the exact behavior that regressed.

## Deterministic tests

Non-determinism is a virulent infection — one flaky test erodes trust in the whole suite. Common sources and fixes:

| Source | Problem | Fix |
|---|---|---|
| `now()` / `new Date()` | different result over time | inject a clock; use fake timers |
| random generators | different data each run | seedable fakers or fixed values |
| test ordering | state leaks between tests | fresh dependencies in a `beforeEach` (never `beforeAll`) |
| external services | latency, availability | in-memory fakes or network-boundary interception |
| filesystem | paths differ across OS | in-memory abstractions |
| shared mutable state | cascading, order-dependent failures | each test builds and tears down its own world |

## Tests are first-class code (living documentation)

Test code is **not** a second-class citizen. It demands the same thought, design, and care as production code, because it evolves alongside production and, left dirty, rots faster.

- **Dirty tests are worse than none.** As production grows, tests must grow with it. A messy suite makes every change expensive, breaks in swarms on unrelated edits, and becomes a growing liability the team eventually abandons — after which fear of change sets in and bugs accumulate.
- **Apply production standards.** Readability, meaningful names, small focused helpers, no duplication (via factories and a test DSL). This is what keeps the suite cheap to evolve — and only a suite that survives gives the confidence to decide.
- **Dual Standard.** Test and production code may differ **only** on efficiency (a test may use a less-optimized but clearer approach). They may **never** differ on design and cleanliness — there the bar is identical.
- **Minimize coupling to production detail.** If one production change breaks hundreds of tests, the suite is badly designed. Test behavior through the public interface, not internal mechanics, so a requirement change touches the fewest tests.
- **The payoff — a living, low-level spec.** A clean suite documents the system in your own language, shows how the APIs are used, actually runs, and cannot silently go stale: if it drifts from the code, it breaks. That is documentation no comment or external doc can match.

### Practical readability lessons

- **Assert format once.** If output is text/UI, assert the full format in a single test; other tests assert the computed values. Re-checking the whole string everywhere couples every test to presentation.
- **Test data reveals intent.** Use values that explain *why* the test exists (`movie("Regular", REGULAR)`), not copied production data.
- **Test behavior, not internal detail.** Assert the output of a small behavioral concept, so the test survives refactors that don't change behavior.
- **Don't make things public just to test them.** If an extracted helper only serves its origin, keep it private and cover it via integration through the public class. Promote to public (with its own unit test) only a sub-behavioral unit useful in other contexts.

## Test DSL — the refactor target after green

The refactor step of red → green → refactor cleans **test** code as much as production code, and its main move is growing a **test DSL**: a layer of intention-revealing helpers that wrap the system's API so each test reads like a specification of the domain. A DSL is never designed up front — it **emerges** from refactoring tests whose setup and assertion noise was hiding intent, exactly as you refactor production code.

Each technique is the same idea — push the mechanics into a named helper, leave the intent in the test:

- **Builders / mother objects** — construct objects with meaningful defaults so a test states only what it's about. Object Mother + Builder (`UserObjectMother.createUser().admin().build()`) is the domain-language form — see `backend-patterns.md`.
- **Composed assertions / custom matchers** — helpers that express the goal, not the mechanics: `assertResponseContains(...)`, `expect(user).toBeAdmin()`.
- **Composed results** — compress a result too large to read into a smaller comparable form and assert against that (six scattered assertions become one).

```
// noisy — speaks the raw API
const path     = PagePath.parse("/root/page")
const response = new Responder(page).respond(request)
expect(cast(response).body).toContain("welcome")

// with a test DSL — speaks the domain
givenPage("/root/page")
whenRequested()
assertResponseContains("welcome")
```

It applies at **every level**: unit (builders + custom matchers), integration (setup helpers), and acceptance — where Given/When/Then is itself a business-readable DSL (see `acceptance-bdd.md`). Invest in it: the DSL is what lets the suite double as living documentation.
