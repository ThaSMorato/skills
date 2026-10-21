---
name: tm-c4-generate
description: "Generate C4 diagrams (PlantUML); C1/C2 from the HLD, the system C3 from the component map, C3/C4 per feature from the FDD."
---

> **Codex.** Paths that start with `references/` are inside this skill's folder (the folder of this `SKILL.md`);
> in a shell command, write them as absolute paths. A stage named `$thasmorato-skills:tm-<name>` is another entry
> of this plugin: tell the owner to run it, never run it yourself.

> **Codex setup.** This stage spawns plugin subagents. Before anything else, read
> `~/.codex/thasmorato-skills.json` (or `$CODEX_HOME/thasmorato-skills.json`). If it is missing or its `version`
> is not `0.6.7`, stop and tell the owner to run `$thasmorato-skills:tm-setup`, then this stage again.
> Plugin subagents carry the `tm-` prefix: their `agent_type` is `tm-` followed by the agent's name.

**Argument** (the text after the skill name): (optional) feature name for the feature-level diagrams; omit for the system levels


Call the `spawn_agent` tool with `agent_type = "tm-c4-generator"` to generate C4 PlantUML diagrams into `docs/c4/`:

- **System levels** from `docs/hld.md` (C1, C2) and `docs/components.md` (C3).
- **Feature levels** for the text after the skill name from `docs/fdd/<feature>.md` (C3, and C4 where code-level detail exists).

If neither the HLD nor an FDD exists, tell the user to run `$thasmorato-skills:tm-hld` or `$thasmorato-skills:tm-fdd` first. If the HLD exists but `docs/components.md` does not, note that the system C3 will be skipped and that `$thasmorato-skills:tm-components` produces its source.

After the agent returns, show which C4 levels were generated and which were skipped (with the reason), and the output paths.
