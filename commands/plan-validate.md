---
description: Validate an implementation plan before coding — gaps, ambiguity, dependency cycles, untestable criteria — and emit a clean/dirty verdict that gates /implement.
argument-hint: <plan slug, e.g. 03-checkout>
---

Use the `plan-validate` skill to validate the plan for: $ARGUMENTS

Read the plan and everything it answers to — the ticket, the node map it points at, the FDD, the ADRs, the boundary contract — and scan for issues: inconsistencies, ambiguities, dependency gaps and cycles, untestable acceptance criteria, coverage gaps, oversized SIs, divergence from the node map, and missing deliverable commands. Write `validation.md` with a `status: clean | dirty` verdict.

If dirty, report exactly what to fix. If clean, tell the user to run `/implement <slug>`.
