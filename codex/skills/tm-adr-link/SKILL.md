---
name: tm-adr-link
description: "Maintain the ADR link graph (supersedes/amends inverses) and refresh the timeline index."
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


Call the `spawn_agent` tool with `agent_type = "tm-adr-linker"` to repair the bidirectional link metadata across `docs/adr/*.md` and regenerate `docs/adr/index.md` (timeline + graph).

If `docs/adr/` has no ADRs, tell the user to generate some first with `$thasmorato-skills:tm-adr-generate`.

After the agent returns, show a short summary: inverses repaired, statuses updated to `superseded`, and the index location.
