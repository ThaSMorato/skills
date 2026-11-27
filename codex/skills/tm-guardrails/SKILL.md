---
name: tm-guardrails
description: "Install the checks a repository is missing, using the commands it already has: pre-commit hook, CI job, a Claude Code hook that blocks destructive git, and optionally a dependency linter for docs/architecture/boundaries.md. Each one is proven to fire."
---

> **Codex.** Paths that start with `references/` are inside this skill's folder (the folder of this `SKILL.md`);
> in a shell command, write them as absolute paths. A stage named `$thasmorato-skills:tm-<name>` is another entry
> of this plugin: tell the owner to run it, never run it yourself.
>
> A command or an agent that takes time is waited on **once**: give `exec_command` or `write_stdin` a `yield_time_ms`
> long enough for it to finish (minutes for a test suite, never one second), and call `wait_agent` once for an agent.
> Every poll re-sends this whole conversation and learns nothing. Send a progress `send_message` when a step
> finishes, not while it runs.

**Argument** (the text after the skill name): [what to set up: pre-commit, ci, git-guard, deps; empty for all]


Read `references/skills/guardrails/index.md` and follow it for: the text after the skill name

> Read the `asking` skill (`references/skills/asking/index.md`) before you report or ask.

Preflight: this is a git repository with at least one check command (lint, type check or test) that can be found. With none, say so: there is nothing to wire in, and the stack guide (`$thasmorato-skills:tm-generate-stack-guide`) or the owner has to name the commands first.

Postflight: the inventory table, what was installed and where, how each item was proven to fire, anything left non-blocking and why, and that a new Claude Code session is needed for the git guard to load.
