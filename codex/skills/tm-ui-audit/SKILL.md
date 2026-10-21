---
name: tm-ui-audit
description: "Evaluate an existing screen in the running software and list its problems with evidence and severity: an isolated design critique, a technical pass and a worst-case data run. Reports; never edits."
---

> **Codex.** Paths that start with `references/` are inside this skill's folder (the folder of this `SKILL.md`);
> in a shell command, write them as absolute paths. A stage named `$thasmorato-skills:tm-<name>` is another entry
> of this plugin: tell the owner to run it, never run it yourself.

> **Codex setup.** This stage spawns plugin subagents. Before anything else, read
> `~/.codex/thasmorato-skills.json` (or `$CODEX_HOME/thasmorato-skills.json`). If it is missing or its `version`
> is not `0.6.7`, stop and tell the owner to run `$thasmorato-skills:tm-setup`, then this stage again.
> Plugin subagents carry the `tm-` prefix: their `agent_type` is `tm-` followed by the agent's name.

**Argument** (the text after the skill name): <screen: a route, URL or name>


Read the `ui-audit` skill (`references/skills/ui-audit/index.md`) for: the text after the skill name

> Read the `asking` skill (`references/skills/asking/index.md`) before you report or ask: resolve every id to what it means, offer a structured choice where the answer is a closed set, and ask only what is genuinely a decision.

Preflight: the screen is named and can run (a route or URL the dev server serves). With no running server and no way to start one, stop and say so: an audit from the code alone is a guess about what the user sees.

Postflight: the path to `audit.md` and the HTML report (opened), the heuristics score, the counts by severity, the P0 and P1 findings resolved to their words, the strengths, what was not covered, and the next step: `$thasmorato-skills:tm-ui-design <screen>` or a ticket per fix.
