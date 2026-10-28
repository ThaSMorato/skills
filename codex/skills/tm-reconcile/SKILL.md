---
name: tm-reconcile
description: "Re-measure the dependency graph and reconcile it with the component map and boundary contract (drift since the last measurement, the commits behind it, the amendments each owning stage should make, and at most three latent-component proposals backed by measured evidence)."
---

> **Codex.** Paths that start with `references/` are inside this skill's folder (the folder of this `SKILL.md`);
> in a shell command, write them as absolute paths. A stage named `$thasmorato-skills:tm-<name>` is another entry
> of this plugin: tell the owner to run it, never run it yourself.

> **Codex setup.** This stage spawns plugin subagents. Before anything else, read
> `~/.codex/thasmorato-skills.json` (or `$CODEX_HOME/thasmorato-skills.json`). If it is missing or its `version`
> is not `0.7.0`, stop and tell the owner to run `$thasmorato-skills:tm-setup`, then this stage again.
> Plugin subagents carry the `tm-` prefix: their `agent_type` is `tm-` followed by the agent's name.

**Argument** (the text after the skill name): (none)


Call the `spawn_agent` tool with `agent_type = "tm-reconciler"` to reconcile the structure of this repository.

> Read the `asking` skill (`references/skills/asking/index.md`) before you report or ask: resolve every id to what it means, offer a structured choice where the answer is a closed set, and ask only what is genuinely a decision.

Preflight: `docs/components.md` must exist. Without a component map there is nothing to reconcile against. Say so and point at `$thasmorato-skills:tm-components` (or `$thasmorato-skills:tm-analyze` in brownfield) instead of delegating.

After it returns, show:
- **the drift**, grouped by the stage that owns the fix: what `$thasmorato-skills:tm-components` should amend, then what `$thasmorato-skills:tm-boundaries` should. Each item comes with the commits that introduced it.
- **the latent-component proposals** (at most three), each with its CCP / CRP / REP evidence, and the count below the cut;
- what could not be measured.

Then ask which amendments to run. This command changes no document: `$thasmorato-skills:tm-components` and `$thasmorato-skills:tm-boundaries` apply the amendments, each with its own protocol (permanent ids, `Retired` rows, fix/amend verdicts). An accepted latent-component proposal becomes a structural ticket through `$thasmorato-skills:tm-tickets`.
