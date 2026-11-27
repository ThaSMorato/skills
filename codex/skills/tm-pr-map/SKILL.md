---
name: tm-pr-map
description: "Map a pull request before reviewing it, without touching it: what it changes and why, the attention it needs, every changed file once by role, the links between them, an order to read them, and what CI proved."
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

**Argument** (the text after the skill name): <pull request number or URL | base..head>


Read `references/skills/pr-map/index.md` and follow it for: the text after the skill name

> Read the `asking` skill (`references/skills/asking/index.md`) before you report or ask.

Preflight: the argument names a pull request or two refs. With none, list the open pull requests (`gh pr list`) and ask which one. For a pull request, `gh auth status` passes and `gh pr view` finds it; for two refs, both resolve. A pull request with no changed files has nothing to map: say so and stop.

Postflight: the page's path (opened), the record's path, the review attention with its reason, what CI proved and what nothing proves, and the recommended next step. Stop there: posting, reviewing and checking the branch out are the owner's to start.
