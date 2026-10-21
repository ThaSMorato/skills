---
name: tm-adr-generate
description: "Write a formal ADR (MADR) from a confirmed Potential ADR."
---

> **Codex.** Paths that start with `references/` are inside this skill's folder (the folder of this `SKILL.md`);
> in a shell command, write them as absolute paths. A stage named `$thasmorato-skills:tm-<name>` is another entry
> of this plugin: tell the owner to run it, never run it yourself.

> **Codex setup.** This stage spawns plugin subagents. Before anything else, read
> `~/.codex/thasmorato-skills.json` (or `$CODEX_HOME/thasmorato-skills.json`). If it is missing or its `version`
> is not `0.6.7`, stop and tell the owner to run `$thasmorato-skills:tm-setup`, then this stage again.
> Plugin subagents carry the `tm-` prefix: their `agent_type` is `tm-` followed by the agent's name.

**Argument** (the text after the skill name): <potential ADR file or slug>


Call the `spawn_agent` tool with `agent_type = "tm-adr-generator"` to write a formal ADR into `docs/adr/` from the confirmed Potential ADR: the text after the skill name

If no Potential ADR was given, list what's in `docs/adr/potential/` **whose `state` is `proposed`** and ask which to formalize. If none are pending, tell the user to run `$thasmorato-skills:tm-adr-identify` first.

After the agent returns, show the new ADR's number, title, status, and any relationships set, and confirm the Potential was marked `formalized`. Then suggest running `$thasmorato-skills:tm-adr-link` to update the graph.
