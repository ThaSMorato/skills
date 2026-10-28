---
name: tm-hld
description: "Write the High-Level Design from the PRD (docs/prd.md)."
---

> **Codex.** Paths that start with `references/` are inside this skill's folder (the folder of this `SKILL.md`);
> in a shell command, write them as absolute paths. A stage named `$thasmorato-skills:tm-<name>` is another entry
> of this plugin: tell the owner to run it, never run it yourself.

> **Codex setup.** This stage spawns plugin subagents. Before anything else, read
> `~/.codex/thasmorato-skills.json` (or `$CODEX_HOME/thasmorato-skills.json`). If it is missing or its `version`
> is not `0.7.0`, stop and tell the owner to run `$thasmorato-skills:tm-setup`, then this stage again.
> Plugin subagents carry the `tm-` prefix: their `agent_type` is `tm-` followed by the agent's name.

**Argument** (the text after the skill name): (optional) path to the PRD, if not docs/prd.md


Call the `spawn_agent` tool with `agent_type = "tm-hld-writer"` to synthesize a High-Level Design into `docs/hld.md` from the PRD (the text after the skill name, or `docs/prd.md` by default).

> Read the `asking` skill (`references/skills/asking/index.md`) before you report or ask: resolve every id to what it means, offer a structured choice where the answer is a closed set, and ask only what is genuinely a decision.

If the PRD doesn't exist, tell the user to run `$thasmorato-skills:tm-prd` first instead of delegating.

After the agent returns, show a short summary: the components and main flows, the cross-cutting drivers, any `> Needs Input` markers (these block approval) and every `> Assumed:` marker, grouped, for the user to confirm or correct, and any decisions flagged as ADR candidates. Don't edit the HLD yourself; if changes are needed, re-run the agent with the correction. The one edit you make directly is rewriting a confirmed `> Assumed:` as `> Decided:` (the `asking` skill §5).
