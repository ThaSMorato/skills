---
description: Break one ticket into a validated implementation plan — vertical SIs with tests, dependencies, and acceptance criteria.
argument-hint: <ticket file/number, or the work to plan>
---

Use the `plan` skill to turn this into an implementation plan: $ARGUMENTS

Read the ticket (or the work the user points to) plus the FDD, ADRs, guidelines, and `CONTEXT.md`. If there's no node map yet, run the `design` skill first. Slice the work into vertical Step Implementations, confirm the granularity and seams with the user, and write the plan to `.scratch/<feature-slug>/plans/<NN>-<slug>/plan.md`.

Then tell the user to run `/plan-validate <slug>` before implementing.
