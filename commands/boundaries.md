---
description: Write the boundary contract from the component map and the FDDs — allowed dependency edges, policy vs detail, plug points, as a machine-checkable manifest.
argument-hint: (none) — runs once per project, revisited when a large epic changes the structure
---

Use the `boundary-architect` agent to write `docs/boundaries.md`.

This is the second of the two architecture beats. `/components` said **what the parts are**, before the FDDs, so every feature spec had a shared vocabulary. This one says **who may depend on whom**, after the FDDs, because only the feature specs reveal the axes of change that a boundary is supposed to separate.

If `docs/components.md` is missing, tell the user to run `/components` first. If no FDD exists yet, say so — a contract written before the specs is a guess, and the whole point of the ordering is not to guess.

After the agent returns, show: the layering, the allowed-edge count, every **inversion** (each an ADR candidate), the plug points, and — in brownfield — the divergences with their `fix`/`amend` verdicts.

**GATE (strong).** A wrong boundary contaminates every ticket downstream: `/tickets` slices against it, `/design` places nodes in it, `/implement` treats an edge outside it as illegal, and `review-architecture` judges by it. On approval, set `Status: approved`.

Then run `/adr-identify` so the inversions become recorded decisions, and `/tickets <feature>` to start the code phase.
