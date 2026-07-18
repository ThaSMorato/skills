---
name: tdd
description: Test-driven development — the red-green loop that produces tests worth keeping. Use when building features or fixing bugs test-first, or when the user mentions red-green-refactor.
---

TDD is the red → green loop. Consult these before and during every cycle.

Read `CONTEXT.md` (if present) so test names and interface vocabulary match the domain; respect the ADRs and the guidelines in the area you're touching.

## What a good test is
Verifies **behavior through public interfaces**, not implementation details. It reads like a specification ("user can checkout with valid cart") and survives refactors because it doesn't care about internal structure.

## Seams — where tests go
A **seam** is the public boundary you test at. Test only at **pre-agreed seams** — write them down and confirm them with the user before writing any test. You can't test everything; agreeing seams up front lands effort on the critical paths.

## Anti-patterns
- **Implementation-coupled** — mocks internal collaborators, tests privates, or verifies through a side channel. The tell: it breaks on a refactor when behavior didn't change.
- **Tautological** — the assertion recomputes the expected value the way the code does. Expected values must come from an independent source (a known-good literal, a worked example, the spec).
- **Horizontal slicing** — all tests first, then all implementation. Work in **vertical slices**: one test → one implementation → repeat, each test a tracer bullet.

## Rules of the loop
- **Red before green.** Write the failing test first, then only enough code to pass it. No speculative features.
- **One slice at a time.** One seam, one test, one minimal implementation per cycle.
- **Refactoring is not part of the loop** — it belongs to the review stage.
