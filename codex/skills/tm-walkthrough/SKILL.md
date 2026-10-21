---
name: tm-walkthrough
description: "Teach the owner the change the AI built before it merges: an HTML lesson over the ticket's diff (what it does, where it lives, the path per acceptance criterion, what can go wrong) with a recall quiz, then re-explain what was missed."
---

> **Codex.** Paths that start with `references/` are inside this skill's folder (the folder of this `SKILL.md`);
> in a shell command, write them as absolute paths. A stage named `$thasmorato-skills:tm-<name>` is another entry
> of this plugin: tell the owner to run it, never run it yourself.

> **Codex setup.** This stage spawns plugin subagents. Before anything else, read
> `~/.codex/thasmorato-skills.json` (or `$CODEX_HOME/thasmorato-skills.json`). If it is missing or its `version`
> is not `0.6.7`, stop and tell the owner to run `$thasmorato-skills:tm-setup`, then this stage again.
> Plugin subagents carry the `tm-` prefix: their `agent_type` is `tm-` followed by the agent's name.

**Argument** (the text after the skill name): <ticket slug> <fixed point, the one $thasmorato-skills:tm-review used>


Read `references/skills/walkthrough/index.md` and follow it for: the text after the skill name

> Read the `asking` skill (`references/skills/asking/index.md`) before you report or ask: resolve every id to what it means, offer a structured choice where the answer is a closed set, and ask only what is genuinely a decision.

Preflight: the ticket's `progress.md` has `status: completed`, the fixed point resolves, and the diff is non-empty. A review file should exist; without one, say that the lesson cannot include what the review accepted, and go on.

Postflight: the lesson's path (opened), the quiz result after the owner answers (missed, still unclear), what was decided for anything still unclear, and the next step, `$thasmorato-skills:tm-pr <slug> <fixed point>`.
