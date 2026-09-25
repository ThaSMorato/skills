---
description: Re-measure the dependency graph and reconcile it with the component map and boundary contract — drift since the last measurement, the commits behind it, the amendments each owning stage should make, and at most three latent-component proposals backed by measured evidence.
argument-hint: "(none)"
---

Use the `reconciler` agent to reconcile the structure of this repository.

> Load the `asking` skill before you report or ask: resolve every id to what it means, offer a structured choice where the answer is a closed set, and ask only what is genuinely a decision.

Preflight: `docs/components.md` must exist. Without a component map there is nothing to reconcile against. Say so and point at `/components` (or `/analyze` in brownfield) instead of delegating.

After it returns, show:
- **the drift**, grouped by the stage that owns the fix: what `/components` should amend, then what `/boundaries` should. Each item comes with the commits that introduced it.
- **the latent-component proposals** (at most three), each with its CCP / CRP / REP evidence, and the count below the cut;
- what could not be measured.

Then ask which amendments to run. This command changes no document: `/components` and `/boundaries` apply the amendments, each with its own protocol (permanent ids, `Retired` rows, fix/amend verdicts). An accepted latent-component proposal becomes a structural ticket through `/tickets`.
