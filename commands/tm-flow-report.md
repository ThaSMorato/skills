---
description: 'Gather what several projects learned about the plugin itself: their flow-tagged retro and session findings grouped by the stage they would change, and the flow measurements per plugin version, ranked into proposals for the next version.'
argument-hint: "(none): the reports registry · or <project paths, or a file listing them one per line>"
disable-model-invocation: true
---

Read `${CLAUDE_PLUGIN_ROOT}/skills/flow-report/SKILL.md` and follow it for: $ARGUMENTS

> Call the Skill tool with `thasmorato-skills:asking` before you report or ask: resolve every id to what it means, offer a structured choice where the answer is a closed set, and ask only what is genuinely a decision.

Preflight: at least one project resolves, from the paths given or, with none, from the registry of recorded reports. A project with no `docs/retro/` and no `docs/meta-retro/` is listed as not read, not an error; if none has either, tell the user to run `/tm-retro` or `/tm-session-analyze` in them first.

Postflight: the report's path, the findings repeated across projects (the proposals), the measurement directions per version with their ticket counts, and what could not be told. Then ask which proposals enter the next version's backlog.
