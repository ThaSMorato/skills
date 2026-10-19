---
description: Cut the product into epics and features, ordered by risk, with cross-feature dependencies and requirement coverage.
argument-hint: "(none): runs once per product scope, re-run when the PRD scope changes"
---

Read [living-docs policy](../policies/living-docs.md) before performing this stage; apply its contracts to the output.

Delegate to subagent `decomposer` to write `docs/features/README.md` from `docs/produto/prd.md`, `docs/arquitetura/hld.md` and `docs/arquitetura/components.md`.

> Load skill `thasmorato-skills:asking` before you report or ask: resolve every id to what it means, offer a structured choice where the answer is a closed set, and ask only what is genuinely a decision.

Nothing else in the flow produces this list. `/tm-fdd` asks *which feature to spec* and takes the answer from whoever is at the keyboard, so the set of features exists only in someone's head, sizes drift, and coverage cannot be checked because there is no denominator.

If `docs/produto/prd.md` is missing, tell the user to run `/tm-prd` first. If `docs/arquitetura/components.md` is missing, say so and continue; the decomposition still works, but the parallel-safety column will be empty and `/tm-boundaries` will have less to check against.

## If `docs/features/README.md` already exists
This is an **amendment**, not a rewrite. Ids are permanent addresses: `docs/features/<slug>/fdd.md` paths and the `.scratch/<slug>/issues/` directories `/tm-tickets` published are keyed on them, so renumbering breaks artifacts that already exist. New items get a suffixed id (`F3a`); removed IDs redirect to their current owner. Tell the user which rows changed.

## After the agent returns
Show:
- the **epic order and why**: what each front-loaded epic exists to falsify, and which edges are soft (should precede, must never block);
- the epics' parallel-safe sets;
- the features under each, with their cross-feature dependencies;
- **any requirement not fully covered**, including anything marked `partial`;
- any journey-vs-component divergence, and any stable redirect aliases this run added.

**GATE (medium).** Coverage is the thing to look at first: that column is the whole reason this stage exists, and `partial` rows are the ones most likely to be wrong, because a half-covered requirement looks covered from every other angle.

Then run `/tm-doc-validate prd features` before the gate, and `/tm-fdd <feature>` per feature afterwards. Independent features can be specced in parallel.

## Stage boundary
Deliver this stage's artifact, name the next command as a recommendation to the owner, and stop the turn. Never invoke another stage, repeat this stage, or ask another agent/harness to perform the next stage. A dirty verdict is a report, never an automatic fix/revalidate loop. Only `/tm-flow` may coordinate transitions, each after an explicit owner gate. A subagent does its assigned work itself and never delegates again.
