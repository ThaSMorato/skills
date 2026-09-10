---
description: Break one ticket into a validated implementation plan — vertical SIs with tests, dependencies, and acceptance criteria.
argument-hint: <ticket file/number, or the work to plan>
---

Use the `plan` skill to turn this into an implementation plan: $ARGUMENTS

Read the ticket (or the work the user points to) plus the node map, the FDD, the boundary contract, ADRs, guidelines, and `CONTEXT.md`.

**Preflight:** the node map must exist at `.scratch/<feature-slug>/design/<NN>-<slug>.md`. If it doesn't, stop and tell the user to run `/design <ticket>` first — designing inside this command collapses two gates into one and leaves the design contract unwritten.

Slice the work into vertical Step Implementations, each acceptance criterion owned by id, confirm the granularity and seams with the user, and write the plan to `.scratch/<feature-slug>/plans/<NN>-<slug>/plan.md`.

Then tell the user to run `/plan-validate <slug>` before implementing.
