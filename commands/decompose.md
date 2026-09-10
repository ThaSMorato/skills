---
description: Cut the product into epics and features, with requirement coverage — the list every FDD and every parallel-work decision depends on.
argument-hint: (none) — runs once per product scope, re-run when the PRD scope changes
---

Use the `decomposer` agent to write `docs/features.md` from `docs/prd.md`, `docs/hld.md` and `docs/components.md`.

Nothing else in the flow produces this list. `/fdd` asks *which feature to spec* and takes the answer from whoever is at the keyboard — so the set of features exists only in someone's head, sizes drift, and coverage cannot be checked because there is no denominator.

If `docs/prd.md` is missing, tell the user to run `/prd` first. If `docs/components.md` is missing, say so and continue — the decomposition still works, but the parallel-safety column will be empty and `/boundaries` will have less to check against.

After the agent returns, show: the epics with their parallel-safe sets, the features under each with the requirements they cover, **any requirement no feature covers**, and any journey-vs-component divergences.

**GATE (medium).** The user confirms the cut. Uncovered requirements are the thing to look at first — that column is the whole reason this stage exists. On approval, set `Status: approved`.

Then run `/fdd <feature>` per feature. Independent features can be specced in parallel.
