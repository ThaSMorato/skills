---
name: tm-adr-propose
description: "Triage one decision the owner wants to make (\"adopt X\", \"stop doing Y\") before anything is planned on it (new, amends an ADR, supersedes one, or already decided) and record it as a Potential ADR."
---

> **Codex.** Paths that start with `references/` are inside this skill's folder (the folder of this `SKILL.md`);
> in a shell command, write them as absolute paths. A stage named `$thasmorato-skills:tm-<name>` is another entry
> of this plugin: tell the owner to run it, never run it yourself.

> **Codex setup.** This stage spawns plugin subagents. Before anything else, read
> `~/.codex/thasmorato-skills.json` (or `$CODEX_HOME/thasmorato-skills.json`). If it is missing or its `version`
> is not `0.7.0`, stop and tell the owner to run `$thasmorato-skills:tm-setup`, then this stage again.
> Plugin subagents carry the `tm-` prefix: their `agent_type` is `tm-` followed by the agent's name.

**Argument** (the text after the skill name): "<the decision, in your words>"


Call the `spawn_agent` tool with `agent_type = "tm-adr-analyzer"` in its one-decision mode (its `## One decision (triage)` section), passing the decision in the owner's words: the text after the skill name

> Read the `asking` skill (`references/skills/asking/index.md`) before you report or ask: resolve every id to what it means, offer a structured choice where the answer is a closed set, and ask only what is genuinely a decision.

A decision announced in a conversation ("let's use Redis for the sessions") is the one the sweep of `$thasmorato-skills:tm-adr-identify` never sees: it lives in no design document yet. Planned on directly, it lands in code without a record, or contradicts an ADR nobody reread. This command puts it through the same triage first.

Preflight: a decision was given; if not, ask for it in one sentence. If `docs/adr/` does not exist, say that this is the project's first ADR and continue.

After the agent returns, show the triage:
- **already decided**: the ADR that says it, with its title, and stop;
- **not ADR-worthy**: the reason from the funnel, and stop;
- otherwise the relationship (`new`, `amends` or `supersedes`, each ADR by number and title), the scope, the requirements and features it binds, whether it is retroactive, and every `> Needs Input:`, as one structured question when the relationship has two readings.

Postflight: the path to the Potential ADR, and the next command, which the owner runs:

`$thasmorato-skills:tm-adr-generate <potential>`
