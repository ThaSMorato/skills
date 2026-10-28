---
description: Re-measure the dependency graph and reconcile it with the component map and boundary contract (drift since the last measurement, the commits behind it, the amendments each owning stage should make, and at most three latent-component proposals backed by measured evidence).
argument-hint: "(none)"
disable-model-invocation: true
---

Call the Agent tool with `reconciler` to reconcile the structure of this repository.

> Call the Skill tool with `thasmorato-skills:asking` before you report or ask: resolve every id to what it means, offer a structured choice where the answer is a closed set, and ask only what is genuinely a decision.

Preflight: `docs/components.md` must exist. Without a component map there is nothing to reconcile against. Say so and point at `/tm-components` (or `/tm-analyze` in brownfield) instead of delegating.

After it returns, show:
- **the drift**, grouped by the stage that owns the fix: what `/tm-components` should amend, then what `/tm-boundaries` should. Each item comes with the commits that introduced it.
- **the latent-component proposals** (at most three), each with its CCP / CRP / REP evidence, and the count below the cut;
- what could not be measured.

Then ask which amendments to run. This command changes no document: `/tm-components` and `/tm-boundaries` apply the amendments, each with its own protocol (permanent ids, `Retired` rows, fix/amend verdicts). An accepted latent-component proposal becomes a structural ticket through `/tm-tickets`.
