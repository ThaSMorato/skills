---
name: tm-components
description: "Build the system component map from the HLD, the named parts every FDD maps its feature onto (the system-level C3)."
---

> **Codex.** Paths that start with `references/` are inside this skill's folder (the folder of this `SKILL.md`);
> in a shell command, write them as absolute paths. A stage named `$thasmorato-skills:tm-<name>` is another entry
> of this plugin: tell the owner to run it, never run it yourself.

> **Codex setup.** This stage spawns plugin subagents. Before anything else, read
> `~/.codex/thasmorato-skills.json` (or `$CODEX_HOME/thasmorato-skills.json`). If it is missing or its `version`
> is not `0.7.0`, stop and tell the owner to run `$thasmorato-skills:tm-setup`, then this stage again.
> Plugin subagents carry the `tm-` prefix: their `agent_type` is `tm-` followed by the agent's name.

**Argument** (the text after the skill name): (none): runs once per system; re-run when the HLD changes or $thasmorato-skills:tm-reconcile reports drift


Call the `spawn_agent` tool with `agent_type = "tm-component-mapper"` to write `docs/architecture/components.md` from `docs/architecture/hld.md`.

> Read the `asking` skill (`references/skills/asking/index.md`) before you report or ask: resolve every id to what it means, offer a structured choice where the answer is a closed set, and ask only what is genuinely a decision.

This is the step that closes a real gap in the chain: the HLD is **required** to list components, and until now nothing turned that list into a shared map, so each FDD invented its own carve-up and nobody owned the cross-feature picture.

If `docs/architecture/hld.md` doesn't exist, tell the user to run `$thasmorato-skills:tm-hld` first instead of delegating.

After the agent returns, show: the component inventory, which are policy and which are detail, any gaps or overlaps the owns/does-not-own pass surfaced, and, in brownfield, the metrics table, any dependency cycles, and where the code's structure diverges from the HLD's. On a re-run, show what was amended and what moved to `Retired`, with the reconcile item behind each.

**Decisions the amendment changed** (the agent returns them, one line each): show every one, then name `$thasmorato-skills:tm-adr-identify`, which records each as an ADR that amends or supersedes the old decision. A changed decision with no ADR is a regression `$thasmorato-skills:tm-doc-validate` reports.

**GATE (strong).** The user approves the map before any FDD is written: every feature spec below depends on these names, and renaming a component afterwards means touching every FDD that used it. On approval, set `Status: approved` in the file.

Then suggest `$thasmorato-skills:tm-c4-generate` for the system C3 diagram, and `$thasmorato-skills:tm-decompose` to cut the product into epics and features along these boundaries.
