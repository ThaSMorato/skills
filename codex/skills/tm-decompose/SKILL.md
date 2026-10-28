---
name: tm-decompose
description: "Cut the product into epics and features, ordered by risk, with cross-feature dependencies and requirement coverage."
---

> **Codex.** Paths that start with `references/` are inside this skill's folder (the folder of this `SKILL.md`);
> in a shell command, write them as absolute paths. A stage named `$thasmorato-skills:tm-<name>` is another entry
> of this plugin: tell the owner to run it, never run it yourself.

> **Codex setup.** This stage spawns plugin subagents. Before anything else, read
> `~/.codex/thasmorato-skills.json` (or `$CODEX_HOME/thasmorato-skills.json`). If it is missing or its `version`
> is not `0.7.0`, stop and tell the owner to run `$thasmorato-skills:tm-setup`, then this stage again.
> Plugin subagents carry the `tm-` prefix: their `agent_type` is `tm-` followed by the agent's name.

**Argument** (the text after the skill name): (optional) the effort slug; runs once per effort, re-run when its scope changes


Call the `spawn_agent` tool with `agent_type = "tm-decomposer"` to amend the feature index (`docs/features/README.md`) and write this effort's cut (`.scratch/<effort>/decomposition.md`) from the effort's brief, `docs/product/prd.md`, `docs/architecture/hld.md` and `docs/architecture/components.md`. The effort is the slug `$thasmorato-skills:tm-interview` gave this work, the folder under `.scratch/`: take it from the argument, or use the only `.scratch/*/brief.md` there is; with more than one and no argument, ask which.

> Read the `asking` skill (`references/skills/asking/index.md`) before you report or ask: resolve every id to what it means, offer a structured choice where the answer is a closed set, and ask only what is genuinely a decision.

Nothing else in the flow produces this list. `$thasmorato-skills:tm-fdd` asks *which feature to spec* and takes the answer from whoever is at the keyboard, so the set of features exists only in someone's head, sizes drift, and coverage cannot be checked because there is no denominator.

If `docs/product/prd.md` is missing, tell the user to run `$thasmorato-skills:tm-prd` first. If `docs/architecture/components.md` is missing, say so and continue; the decomposition still works, but the parallel-safety column will be empty and `$thasmorato-skills:tm-boundaries` will have less to check against.

## The index already exists
It always is an **amendment**, not a rewrite: the index is the system's, and this effort only adds, changes or retires rows. Ids are permanent addresses: the `docs/features/<slug>/` folders and the `.scratch/<slug>/issues/` directories `$thasmorato-skills:tm-tickets` published are keyed on them, so renumbering breaks artifacts that already exist. New items get a suffixed id (`F3a`); removed ones are struck through in `Retired` with their reason. Tell the user which rows changed.

## After the agent returns
Show:
- the **epic order and why**: what each front-loaded epic exists to falsify, and which edges are soft (should precede, must never block);
- the epics' parallel-safe sets;
- the features under each, with their cross-feature dependencies;
- **any requirement not fully covered**, including anything marked `partial`;
- any journey-vs-component divergence, and any `Retired` rows this run added.

**GATE (medium).** Coverage is the thing to look at first: that column is the whole reason this stage exists, and `partial` rows are the ones most likely to be wrong, because a half-covered requirement looks covered from every other angle.

Then tell the user the next stages, and stop: `$thasmorato-skills:tm-doc-validate prd features` before the gate, and `$thasmorato-skills:tm-fdd <feature>` per feature afterwards. Independent features can be specced in parallel.
