---
name: tm-decision-map
description: "Start or move an effort's decision map, one decision per session, for an effort too big for one session whose path is not clear yet."
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

**Argument** (the text after the skill name): <effort slug>


Read `references/skills/decision-map/index.md` and follow it for: the text after the skill name

> Read the `asking` skill (`references/skills/asking/index.md`) before you report or ask.

Preflight: the argument names the effort, the folder under `.scratch/`. With none, list the efforts that have a `decision-map.md` and ask which one, or the slug of a new one. A `decision-map.md` that exists runs **resume**; none runs **create**. A map with `status: closed` is not reopened: say so, and point at its next step.

Postflight: the map's path, the destination, what this session recorded, the frontier, and the next step as the command for the owner to run. Stop there: the stage that resolves the decision is the owner's to start.
