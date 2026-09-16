---
description: Cut the product into epics and features — ordered by risk, with cross-feature dependencies and requirement coverage.
argument-hint: "(none) — runs once per product scope, re-run when the PRD scope changes"
---

Use the `decomposer` agent to write `docs/features.md` from `docs/prd.md`, `docs/hld.md` and `docs/components.md`.

> Load the `asking` skill before you report or ask: resolve every id to what it means, offer a structured choice where the answer is a closed set, and ask only what is genuinely a decision.

Nothing else in the flow produces this list. `/fdd` asks *which feature to spec* and takes the answer from whoever is at the keyboard — so the set of features exists only in someone's head, sizes drift, and coverage cannot be checked because there is no denominator.

If `docs/prd.md` is missing, tell the user to run `/prd` first. If `docs/components.md` is missing, say so and continue — the decomposition still works, but the parallel-safety column will be empty and `/boundaries` will have less to check against.

## If `docs/features.md` already exists
This is an **amendment**, not a rewrite. Ids are permanent addresses — `docs/fdd/<slug>.md` paths and the `.scratch/<slug>/issues/` directories `/tickets` published are keyed on them, so renumbering breaks artifacts that already exist. New items get a suffixed id (`F3a`); removed ones are struck through in `Retired` with their reason. Tell the user which rows changed.

## After the agent returns
Show:
- the **epic order and why** — what each front-loaded epic exists to falsify, and which edges are soft (should precede, must never block);
- the epics' parallel-safe sets;
- the features under each, with their cross-feature dependencies;
- **any requirement not fully covered**, including anything marked `partial`;
- any journey-vs-component divergence, and any `Retired` rows this run added.

**GATE (medium).** Coverage is the thing to look at first — that column is the whole reason this stage exists, and `partial` rows are the ones most likely to be wrong, because a half-covered requirement looks covered from every other angle.

Then run `/doc-validate prd features` before the gate, and `/fdd <feature>` per feature afterwards. Independent features can be specced in parallel.
