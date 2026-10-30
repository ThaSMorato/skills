---
name: tm-test-audit
description: "Audit a whole test suite (or a path) for missing and useless tests, with mutation over the suite at the report level; report only, remove with your confirmation, or also write the missing tests."
---

> **Codex.** Paths that start with `references/` are inside this skill's folder (the folder of this `SKILL.md`);
> in a shell command, write them as absolute paths. A stage named `$thasmorato-skills:tm-<name>` is another entry
> of this plugin: tell the owner to run it, never run it yourself.

> **Codex setup.** This stage spawns plugin subagents. Before anything else, read
> `~/.codex/thasmorato-skills.json` (or `$CODEX_HOME/thasmorato-skills.json`). If it is missing or its `version`
> is not `0.7.0`, stop and tell the owner to run `$thasmorato-skills:tm-setup`, then this stage again.
> Plugin subagents carry the `tm-` prefix: their `agent_type` is `tm-` followed by the agent's name.

**Argument** (the text after the skill name): <path> [report | confirm | full]  (default: the test roots, report)


Read `references/skills/test-audit/index.md` and follow it for: the text after the skill name

> Read the `asking` skill (`references/skills/asking/index.md`) before you report or ask: resolve every id to what it means, offer a structured choice where the answer is a closed set, and ask only what is genuinely a decision.

Preflight: run the scope's suite once through the `test-runner` agent. A red suite cannot be audited (a removal or an addition cannot be shown to keep it green): report what fails and stop. Name the level that will run, and that only `confirm` and `full` change files.

Postflight: the path to `docs/analysis/test-audit.md`, the counts (absent, excess, mutants), what was removed or added, and what was proposed and not applied.
