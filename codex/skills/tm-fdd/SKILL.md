---
name: tm-fdd
description: "Write a Feature Design Doc for one feature, from the HLD (docs/hld.md)."
---

> **Codex.** Paths that start with `references/` are inside this skill's folder (the folder of this `SKILL.md`);
> in a shell command, write them as absolute paths. A stage named `$thasmorato-skills:tm-<name>` is another entry
> of this plugin: tell the owner to run it, never run it yourself.

> **Codex setup.** This stage spawns plugin subagents. Before anything else, read
> `~/.codex/thasmorato-skills.json` (or `$CODEX_HOME/thasmorato-skills.json`). If it is missing or its `version`
> is not `0.6.7`, stop and tell the owner to run `$thasmorato-skills:tm-setup`, then this stage again.
> Plugin subagents carry the `tm-` prefix: their `agent_type` is `tm-` followed by the agent's name.

**Argument** (the text after the skill name): <feature name or slug>


Call the `spawn_agent` tool with `agent_type = "tm-fdd-writer"` to synthesize a Feature Design Doc into `docs/fdd/<feature-slug>.md` for the feature: the text after the skill name

> Read the `asking` skill (`references/skills/asking/SKILL.md`) before you report or ask: resolve every id to what it means, offer a structured choice where the answer is a closed set, and ask only what is genuinely a decision.

If no feature was given, ask which feature to spec. If `docs/hld.md` doesn't exist, tell the user to run `$thasmorato-skills:tm-hld` first instead of delegating.

After the agent returns, show a short summary: the public contracts, the chosen test seams, the acceptance criteria, and any `> Needs Input` markers (these block approval) and every `> Assumed:` marker, grouped, for the user to confirm or correct. Don't edit the FDD yourself; if changes are needed, re-run the agent with the correction. The one edit you make directly is rewriting a confirmed `> Assumed:` as `> Decided:` (the `asking` skill §5).
