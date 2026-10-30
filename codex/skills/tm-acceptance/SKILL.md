---
name: tm-acceptance
description: "Check every acceptance criterion and every part of the owner's request in the running software (by an agent that did not write the code: browser on the real controls, an HTTP request, a command, a measurement, a named test, or not verified with the reason) after the last change, and record it for $thasmorato-skills:tm-pr."
---

> **Codex.** Paths that start with `references/` are inside this skill's folder (the folder of this `SKILL.md`);
> in a shell command, write them as absolute paths. A stage named `$thasmorato-skills:tm-<name>` is another entry
> of this plugin: tell the owner to run it, never run it yourself.

> **Codex setup.** This stage spawns plugin subagents. Before anything else, read
> `~/.codex/thasmorato-skills.json` (or `$CODEX_HOME/thasmorato-skills.json`). If it is missing or its `version`
> is not `0.7.0`, stop and tell the owner to run `$thasmorato-skills:tm-setup`, then this stage again.
> Plugin subagents carry the `tm-` prefix: their `agent_type` is `tm-` followed by the agent's name.

**Argument** (the text after the skill name): <ticket slug>


Read `references/skills/acceptance/index.md` and follow it for: the text after the skill name

> Read the `asking` skill (`references/skills/asking/index.md`) before you report or ask: resolve every id to what it means, offer a structured choice where the answer is a closed set, and ask only what is genuinely a decision.

Preflight: the ticket's `progress.md` has `status: completed` and a review file exists for it. Run this after the review fixes and `$thasmorato-skills:tm-tidy`, because a later change to production code makes the record stale.

Postflight: one line per AC first, then the path to the acceptance file, the counts by verdict, the `capture only` verdicts, the means provided and whether each was put back, every failure and every item not verified (each quoted), the criteria absorbed into the feature's docs (each with the rule it became and its test) or still waiting on other tickets, and the next step, `$thasmorato-skills:tm-walkthrough` or `$thasmorato-skills:tm-pr`.
