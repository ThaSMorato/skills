---
name: tm-boundaries
description: "Write the boundary contract from the component map and the FDDs (allowed dependency edges, policy vs detail, plug points), as a machine-checkable manifest."
---

> **Codex.** Paths that start with `references/` are inside this skill's folder (the folder of this `SKILL.md`);
> in a shell command, write them as absolute paths. A stage named `$thasmorato-skills:tm-<name>` is another entry
> of this plugin: tell the owner to run it, never run it yourself.

> **Codex setup.** This stage spawns plugin subagents. Before anything else, read
> `~/.codex/thasmorato-skills.json` (or `$CODEX_HOME/thasmorato-skills.json`). If it is missing or its `version`
> is not `0.7.0`, stop and tell the owner to run `$thasmorato-skills:tm-setup`, then this stage again.
> Plugin subagents carry the `tm-` prefix: their `agent_type` is `tm-` followed by the agent's name.

**Argument** (the text after the skill name): (none): runs once per project, revisited when a large epic changes the structure


Call the `spawn_agent` tool with `agent_type = "tm-boundary-architect"` to write `docs/architecture/boundaries.md`.

> Read the `asking` skill (`references/skills/asking/index.md`) before you report or ask: resolve every id to what it means, offer a structured choice where the answer is a closed set, and ask only what is genuinely a decision.

This is the second of the two architecture beats. `$thasmorato-skills:tm-components` said **what the parts are**, before the FDDs, so every feature spec had a shared vocabulary. This one says **who may depend on whom**, after the FDDs, because only the feature specs reveal the axes of change that a boundary is supposed to separate.

If `docs/architecture/components.md` is missing, tell the user to run `$thasmorato-skills:tm-components` first. If no FDD exists yet, say so: a contract written before the specs is a guess, and the whole point of the ordering is not to guess.

After the agent returns, show: the layering, the allowed-edge count, every **inversion** (each an ADR candidate), the plug points, and (in brownfield) the divergences with their `fix`/`amend` verdicts.

**GATE (strong).** A wrong boundary contaminates every ticket downstream: `$thasmorato-skills:tm-tickets` slices against it, `$thasmorato-skills:tm-design` places nodes in it, `$thasmorato-skills:tm-implement` treats an edge outside it as illegal, and `review-architecture` judges by it. On approval, set `Status: approved`.

Then tell the user the next stages, and stop: `$thasmorato-skills:tm-adr-identify`, so the inversions become recorded decisions, and `$thasmorato-skills:tm-tickets <feature>` to start the code phase.
