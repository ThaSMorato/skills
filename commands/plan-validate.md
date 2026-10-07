---
description: Validate an implementation plan before coding (gaps, ambiguity, dependency cycles, untestable criteria) and emit a clean/dirty verdict that gates /implement.
argument-hint: "<plan slug, e.g. 03-checkout>"
---

Call the Skill tool with `plan-validate` to validate the plan for: $ARGUMENTS

> Call the Skill tool with `asking` before you report or ask: resolve every id to what it means, offer a structured choice where the answer is a closed set, and ask only what is genuinely a decision.

Read the plan and everything it answers to (the ticket, the node map it points at, the FDD, the ADRs, the boundary contract) and scan for issues: inconsistencies, ambiguities, dependency gaps and cycles, untestable acceptance criteria, coverage gaps, SIs too big or too small, SIs that own no criterion, dispersion, divergence from the node map, and missing deliverable commands. Write `validation.md` with a `status: clean | dirty` verdict.

If dirty, report exactly what to fix. If clean, show what changed since the owner approved the slicing (when the plan was revised), then tell the user to run `/implement <slug>`; inside `/flow`, ask before starting it. A slicing the owner decided (`## Slicing`) is not re-opened by the size and balance checks.
