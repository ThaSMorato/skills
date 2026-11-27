---
name: tm-ui-design
description: "Design a new screen or redesign an existing one before it is built: the brief in rounds, three directions as HTML with captures, the chosen one through every state and width with an isolated critic, then the screen spec in its feature folder."
---

> **Codex.** Paths that start with `references/` are inside this skill's folder (the folder of this `SKILL.md`);
> in a shell command, write them as absolute paths. A stage named `$thasmorato-skills:tm-<name>` is another entry
> of this plugin: tell the owner to run it, never run it yourself.
>
> A command or an agent that takes time is waited on **once**: give `exec_command` or `write_stdin` a `yield_time_ms`
> long enough for it to finish (minutes for a test suite, never one second), and call `wait_agent` once for an agent.
> Every poll re-sends this whole conversation and learns nothing. Send a progress `send_message` when a step
> finishes, not while it runs.

> **Codex setup.** This stage spawns plugin subagents. Before anything else, read
> `~/.codex/thasmorato-skills.json` (or `$CODEX_HOME/thasmorato-skills.json`). If it is missing or its `version`
> is not `0.7.1`, stop and tell the owner to run `$thasmorato-skills:tm-setup`, then this stage again.
> Plugin subagents carry the `tm-` prefix: their `agent_type` is `tm-` followed by the agent's name.

**Argument** (the text after the skill name): <screen: a name, or the ticket or feature it belongs to>


Read `references/skills/ui-design/index.md` and follow it for: the text after the skill name

> Read the `asking` skill (`references/skills/asking/index.md`) before you report or ask.

Preflight: what the screen is for is written somewhere (a PRD, an FDD, a ticket, or the owner's request); with none, run the brief from the request and say so. For a redesign, an audit should exist (`.scratch/ui-audit/<screen>/audit.md`); without one, offer `$thasmorato-skills:tm-ui-audit <screen>` first, and go on without it only on the owner's word.

Postflight: the path to `docs/features/<feature>/ui/<screen>.md` and its captures, the chosen direction and why, the critic's verdict, the open decisions and every `> Assumed:`, and the next step: `$thasmorato-skills:tm-tickets` or `$thasmorato-skills:tm-design`.
