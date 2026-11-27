---
name: tm-teach
description: "Teach a topic over several sessions in a teaching workspace (mission, trusted sources, learning records, glossary), through short HTML lessons with practice, each pitched just past what you already know."
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

> **Codex setup.** This stage spawns plugin subagents. Before anything else, read
> `~/.codex/thasmorato-skills.json` (or `$CODEX_HOME/thasmorato-skills.json`). If it is missing or its `version`
> is not `0.7.1`, stop and tell the owner to run `$thasmorato-skills:tm-setup`, then this stage again.
> Plugin subagents carry the `tm-` prefix: their `agent_type` is `tm-` followed by the agent's name.

**Argument** (the text after the skill name): <what you want to learn>


Read `references/skills/teach/index.md` and follow it for: the text after the skill name

> Read the `asking` skill (`references/skills/asking/index.md`) before you report or ask.

Preflight: the current directory is the teaching workspace. If it is a code repository or holds unrelated files, say so and suggest a dedicated directory before writing anything; a workspace holds one mission. On a returning session, read `MISSION.md`, the learning records and `NOTES.md` before saying anything.

Postflight: the lesson's path (opened), what it teaches and why now, the learning records written this session with their evidence, and what the next lesson is likely to be.
