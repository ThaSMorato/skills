---
name: tm-implement
description: "Execute a validated plan one SI at a time, test-first (red → green → refactor), run the SI's tests, then STOP before the next SI."
---

> **Codex.** Paths that start with `references/` are inside this skill's folder (the folder of this `SKILL.md`);
> in a shell command, write them as absolute paths. A stage named `$thasmorato-skills:tm-<name>` is another entry
> of this plugin: tell the owner to run it, never run it yourself.

> **Codex setup.** This stage spawns plugin subagents. Before anything else, read
> `~/.codex/thasmorato-skills.json` (or `$CODEX_HOME/thasmorato-skills.json`). If it is missing or its `version`
> is not `0.7.0`, stop and tell the owner to run `$thasmorato-skills:tm-setup`, then this stage again.
> Plugin subagents carry the `tm-` prefix: their `agent_type` is `tm-` followed by the agent's name.

**Argument** (the text after the skill name): <plan slug> [continuous]


Read `references/skills/implement/index.md` and follow it to build the plan: the text after the skill name

Resolve the plan under `.scratch/<feature-slug>/plans/`, run preflight (validation must be `clean` for this version of the plan, branch set up and current with its base, blockers read from `blocker-state.mjs`, dependencies installed, the owner's workspace recorded, the baseline taken), and execute SI by SI, every test run through the `test-runner` agent: red → green → refactor (production **and** tests), run the SI's tests, record progress, then STOP and wait for the user, unless they asked for continuous mode.

Default is to pause after every SI so the user can `/compact` and resume by re-running this command. When done, write the ticket's `manifest.txt` and tell the user to run `$thasmorato-skills:tm-review` before any commit, with `--worktree <manifest>` while the work is uncommitted, and stop.
