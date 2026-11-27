---
name: tm-retro
description: "Look back over a finished epic, feature or cycle from what it left on disk (plans, validations, progress notes, reviews) and record what it taught about the process and the product."
---

> **Codex.** Paths that start with `references/` are inside this skill's folder (the folder of this `SKILL.md`);
> in a shell command, write them as absolute paths. A stage named `$thasmorato-skills:tm-<name>` is another entry
> of this plugin: tell the owner to run it, never run it yourself.
>
> A command or an agent that takes time is waited on **once**: give `exec_command` or `write_stdin` the longest
> `yield_time_ms` the command could need (a test suite takes minutes: ask for them, never for one second), and call
> `wait_agent` once for an agent. When a wait returns before the command ends, wait again with the same long value:
> a second long wait, never a run of short polls.
> Every poll re-sends this whole conversation and learns nothing. Send a progress `send_message` when a step
> finishes, not while it runs.

**Argument** (the text after the skill name): <epic, feature slug, or a set of ticket ids>


Read `references/skills/retro/index.md` and follow it over: the text after the skill name

> Read the `asking` skill (`references/skills/asking/index.md`) before you report or ask.
