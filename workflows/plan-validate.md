---
description: Validate an implementation plan before coding (gaps, ambiguity, dependency cycles, untestable criteria) and emit a clean/dirty verdict that gates /tm-implement.
argument-hint: "<plan slug, e.g. 03-checkout>"
---

Load skill `thasmorato-skills:plan-validate` to validate the plan for: $ARGUMENTS

> Load skill `thasmorato-skills:asking` before you report or ask: resolve every id to what it means, offer a structured choice where the answer is a closed set, and ask only what is genuinely a decision.

Read the plan and everything it answers to (the ticket, the node map it points at, the FDD, the ADRs, the boundary contract) and scan for issues: inconsistencies, ambiguities, dependency gaps and cycles, untestable acceptance criteria, coverage gaps, SIs too big or too small, SIs that own no criterion, dispersion, divergence from the node map, and missing deliverable commands. Write `validation.md` with a `status: clean | dirty` verdict.

If dirty, report exactly what to fix. If clean, show what changed since the owner approved the slicing (when the plan was revised), then tell the user to run `/tm-implement <slug>`; inside `/tm-flow`, ask before starting it. A slicing the owner decided (`## Slicing`) is not re-opened by the size and balance checks.

## Stage boundary
Deliver this stage's artifact, name the next command as a recommendation to the owner, and stop the turn. Never invoke another stage, repeat this stage, or ask another agent/harness to perform the next stage. A dirty verdict is a report, never an automatic fix/revalidate loop. Only `/tm-flow` may coordinate transitions, each after an explicit owner gate. A subagent does its assigned work itself and never delegates again.
