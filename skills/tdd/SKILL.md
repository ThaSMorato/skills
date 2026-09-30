---
name: tdd
description: Test-driven development — the red-green loop that produces tests worth keeping, and the pin-then-flip rule for bugs. Use when building features or fixing bugs test-first, or when the user mentions red-green-refactor.
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

## Bugs: pin the bug, then flip it
A bug is fixed test-first too, in two moves:
1. **Pin it.** Write tests that are **green because of the bug**: they assert today's wrong behavior, and they pass. That proves the test reaches the defect, at the level where the user sees it. Use the real data that exposed it when you have it.
2. **Flip it.** Next to each pin, write the test that expects the **correct** behavior. It is red. That is the red step of the fix.

Do both at **every level the bug crosses**, from the E2E or integration test that shows the symptom down to the unit where the cause lives: a bug fixed only at the bottom can still escape through the path above it. The fix turns every flipped test green. The pinned tests, which now fail, are removed only after the owner has seen the fix and the tests together. They are the record of what was wrong, and deleting them is the owner's call.

If a proposed fix arrives without its pinned and flipped tests, write them before touching the code.

## Rules of the loop
- **Red before green.** Write the failing test first, then only enough code to pass it. No speculative features.
- **One slice at a time.** One seam, one test, one minimal implementation per cycle.
- **Refactoring is not part of the loop** — it belongs to the review stage.
