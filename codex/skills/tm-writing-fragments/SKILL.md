---
name: tm-writing-fragments
description: "Writing, explore phase: an interview that collects raw fragments into one file, with no structure yet."
---

> **Codex.** Paths that start with `references/` are inside this skill's folder (the folder of this `SKILL.md`);
> in a shell command, write them as absolute paths. A stage named `$thasmorato-skills:tm-<name>` is another entry
> of this plugin: tell the owner to run it, never run it yourself.
>
> A command or an agent that takes time is waited on **once**: give `exec_command` or `write_stdin` a `yield_time_ms`
> long enough for it to finish (minutes for a test suite, never one second), and call `wait_agent` once for an agent.
> Every poll re-sends this whole conversation and learns nothing. Send a progress `send_message` when a step
> finishes, not while it runs.

**Argument** (the text after the skill name): [path to the fragments file] [topic]


Read `references/skills/writing-fragments/index.md` and follow it for: the text after the skill name
