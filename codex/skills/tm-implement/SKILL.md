---
name: tm-implement
description: "Execute a validated plan one SI at a time, test-first (red → green → refactor), run the SI's tests, then STOP before the next SI."
---

> **Codex.** Paths that start with `references/` are inside this skill's folder (the folder of this `SKILL.md`);
> in a shell command, write them as absolute paths. A stage named `$thasmorato-skills:tm-<name>` is another entry
> of this plugin: tell the owner to run it, never run it yourself.

**Argument** (the text after the skill name): <plan slug> [continuous]


Read `references/skills/implement/index.md` and follow it to build the plan: the text after the skill name

Resolve the plan under `.scratch/<feature-slug>/plans/`, run preflight (validation must be `clean`, branch must be set up), and execute SI by SI: red → green → refactor (production **and** tests), run the SI's tests, record progress, then STOP and wait for the user, unless they asked for continuous mode.

Default is to pause after every SI so the user can `/compact` and resume by re-running this command. When done, tell the user to run `$thasmorato-skills:tm-review` before any commit, and stop.
