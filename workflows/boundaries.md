---
description: Write the boundary contract from the component map and the FDDs (allowed dependency edges, policy vs detail, plug points), as a machine-checkable manifest.
argument-hint: "(none): runs once per project, revisited when a large epic changes the structure"
---

Delegate to subagent `boundary-architect` to write `docs/arquitetura/boundaries.md`.

> Load skill `thasmorato-skills:asking` before you report or ask: resolve every id to what it means, offer a structured choice where the answer is a closed set, and ask only what is genuinely a decision.

This is the second of the two architecture beats. `/tm-components` said **what the parts are**, before the FDDs, so every feature spec had a shared vocabulary. This one says **who may depend on whom**, after the FDDs, because only the feature specs reveal the axes of change that a boundary is supposed to separate.

If `docs/arquitetura/components.md` is missing, tell the user to run `/tm-components` first. If no FDD exists yet, say so: a contract written before the specs is a guess, and the whole point of the ordering is not to guess.

After the agent returns, show: the layering, the allowed-edge count, every **inversion** (each an ADR candidate), the plug points, and (in brownfield) the divergences with their `fix`/`amend` verdicts.

**GATE (strong).** A wrong boundary contaminates every ticket downstream: `/tm-tickets` slices against it, `/tm-design` places nodes in it, `/tm-implement` treats an edge outside it as illegal, and `review-architecture` judges by it. On approval, set `Status: approved`.

Then run `/tm-adr-identify` so the inversions become recorded decisions, and `/tm-tickets <feature>` to start the code phase.

## Stage boundary
Deliver this stage's artifact, name the next command as a recommendation to the owner, and stop the turn. Never invoke another stage, repeat this stage, or ask another agent/harness to perform the next stage. A dirty verdict is a report, never an automatic fix/revalidate loop. Only `/tm-flow` may coordinate transitions, each after an explicit owner gate. A subagent does its assigned work itself and never delegates again.
