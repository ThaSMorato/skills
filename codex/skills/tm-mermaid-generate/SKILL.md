---
name: tm-mermaid-generate
description: "Generate Mermaid diagrams from an FDD into a single Markdown file."
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
> is not `0.7.0`, stop and tell the owner to run `$thasmorato-skills:tm-setup`, then this stage again.
> Plugin subagents carry the `tm-` prefix: their `agent_type` is `tm-` followed by the agent's name.

**Argument** (the text after the skill name): <feature name or slug>


Call the `spawn_agent` tool with `agent_type = "tm-mermaid-generator"` to generate Mermaid diagrams into `docs/features/<feature>/diagrams/flows.md` from `docs/features/<feature>/fdd.md` for the feature: the text after the skill name

If the FDD doesn't exist, tell the user to run `$thasmorato-skills:tm-fdd` first.

After the agent returns, show the set of diagram views produced (by type) and the output path.
