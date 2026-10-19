---
description: Re-measure the dependency graph and reconcile it with the component map and boundary contract (drift since the last measurement, the commits behind it, the amendments each owning stage should make, and at most three latent-component proposals backed by measured evidence).
argument-hint: "(none)"
---

Delegate to subagent `reconciler` to reconcile the structure of this repository.

> Load skill `thasmorato-skills:asking` before you report or ask: resolve every id to what it means, offer a structured choice where the answer is a closed set, and ask only what is genuinely a decision.

Preflight: `docs/arquitetura/components.md` must exist. Without a component map there is nothing to reconcile against. Say so and point at `/tm-components` (or `/tm-analyze` in brownfield) instead of delegating.

After it returns, show:
- **the drift**, grouped by the stage that owns the fix: what `/tm-components` should amend, then what `/tm-boundaries` should. Each item comes with the commits that introduced it.
- **the latent-component proposals** (at most three), each with its CCP / CRP / REP evidence, and the count below the cut;
- what could not be measured.

Then ask which amendments to run. This command changes no document: `/tm-components` and `/tm-boundaries` apply the amendments, each with its own protocol (permanent ids, stable redirect aliases, fix/amend verdicts). An accepted latent-component proposal becomes a structural ticket through `/tm-tickets`.

## Stage boundary
Deliver this stage's artifact, name the next command as a recommendation to the owner, and stop the turn. Never invoke another stage, repeat this stage, or ask another agent/harness to perform the next stage. A dirty verdict is a report, never an automatic fix/revalidate loop. Only `/tm-flow` may coordinate transitions, each after an explicit owner gate. A subagent does its assigned work itself and never delegates again.

## Harness adapter (generated)
In Claude Code, load a named plugin skill through the Skill tool with its fully qualified `thasmorato-skills:<name>`. Delegate a named subagent through the Agent tool. Never resolve a bare skill name from another plugin. Use AskUserQuestion when available, otherwise numbered options. Relative plugin paths in the source are relative to that source file, not the project cwd.
