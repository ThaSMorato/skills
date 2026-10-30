---
name: tm-audit-deps
description: "Audit the project's dependencies for vulnerable, deprecated, unmaintained or license-risky libraries, using the ecosystem's own audit tools, plus the MCP servers, plugins, hooks and skills the repo declares."
---

> **Codex.** Paths that start with `references/` are inside this skill's folder (the folder of this `SKILL.md`);
> in a shell command, write them as absolute paths. A stage named `$thasmorato-skills:tm-<name>` is another entry
> of this plugin: tell the owner to run it, never run it yourself.

> **Codex setup.** This stage spawns plugin subagents. Before anything else, read
> `~/.codex/thasmorato-skills.json` (or `$CODEX_HOME/thasmorato-skills.json`). If it is missing or its `version`
> is not `0.7.0`, stop and tell the owner to run `$thasmorato-skills:tm-setup`, then this stage again.
> Plugin subagents carry the `tm-` prefix: their `agent_type` is `tm-` followed by the agent's name.

**Argument** (the text after the skill name): (optional) focus, e.g. security, licensing, or an ecosystem


Call the `spawn_agent` tool with `agent_type = "tm-dependency-auditor"` to audit the project's dependencies into `docs/analysis/dependencies.md`. Focus: the text after the skill name

It runs the ecosystem's native `outdated` and `audit` commands as the primary path; those answer authoritatively and offline, and web lookups per package don't scale past a few dozen dependencies. It is analysis-only: read-only commands, never an install or an auto-fix.

After it returns, show the **act now** items first (vulnerable, deprecated, license-incompatible), each with its advisory id, then what is worth planning, then the agent extensions the repo declares (MCP servers, plugins, hooks, skills) with which ones are unpinned. The full inventory stays in the file as an appendix. Also surface anything the audit could not cover: a missing tool, a skipped ecosystem, an unwalked transitive tree.

The report records when and against which commit it ran (`audited_at`, `audited_commit`, `lockfiles`). That is what lets `$thasmorato-skills:tm-flow` offer a re-run once a lockfile changes or 30 days pass. Nothing re-runs it automatically.
