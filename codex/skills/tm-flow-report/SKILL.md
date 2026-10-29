---
name: tm-flow-report
description: "Gather what several projects learned about the plugin itself: their flow-tagged retro and session findings grouped by the stage they would change, and the flow measurements per plugin version, ranked into proposals for the next version."
---

> **Codex.** Paths that start with `references/` are inside this skill's folder (the folder of this `SKILL.md`);
> in a shell command, write them as absolute paths. A stage named `$thasmorato-skills:tm-<name>` is another entry
> of this plugin: tell the owner to run it, never run it yourself.

**Argument** (the text after the skill name): (none): the reports registry · or <project paths, or a file listing them one per line>


Read `references/skills/flow-report/index.md` and follow it for: the text after the skill name

> Read the `asking` skill (`references/skills/asking/index.md`) before you report or ask: resolve every id to what it means, offer a structured choice where the answer is a closed set, and ask only what is genuinely a decision.

Preflight: at least one project resolves, from the paths given or, with none, from the registry of recorded reports. A project with no `docs/retro/` and no `docs/meta-retro/` is listed as not read, not an error; if none has either, tell the user to run `$thasmorato-skills:tm-retro` or `$thasmorato-skills:tm-session-analyze` in them first.

Postflight: the report's path, the findings repeated across projects (the proposals), the measurement directions per version with their ticket counts, and what could not be told. Then ask which proposals enter the next version's backlog.
