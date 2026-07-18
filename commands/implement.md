---
description: Implement one frontier ticket test-first, then review and commit.
argument-hint: <ticket file/number, or the work to implement>
---

Implement the work in the ticket: $ARGUMENTS (a frontier ticket from `/tickets`, or the spec the user points to).

1. Read the ticket, the FDD (`docs/fdd/`), the ADRs (`docs/adr/`), the guidelines (`docs/guidelines.md`), and `CONTEXT.md`.
2. If there's no node map for this work yet, run the `design` skill first (`/design`-style).
3. Use the `tdd` skill at the **pre-agreed seams**. Run typechecking and single test files regularly; the full suite once at the end.
4. **Follow the guidelines** — they are the standard for this repo.
5. When a real architectural decision surfaces mid-implementation, flag it as an **ADR candidate** (back-edge to `/adr-identify`) rather than deciding silently.
6. Review with `/review`, then commit to the current branch.

Work one ticket per fresh context; clear context between tickets.
