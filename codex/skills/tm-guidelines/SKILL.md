---
name: tm-guidelines
description: "Generate the project's engineering guidelines router, an index of stack guides, documents, conventions and real commands (≤150 lines, lazy-loaded)."
---

> **Codex.** Paths that start with `references/` are inside this skill's folder (the folder of this `SKILL.md`);
> in a shell command, write them as absolute paths. A stage named `$thasmorato-skills:tm-<name>` is another entry
> of this plugin: tell the owner to run it, never run it yourself.

> **Codex setup.** This stage spawns plugin subagents. Before anything else, read
> `~/.codex/thasmorato-skills.json` (or `$CODEX_HOME/thasmorato-skills.json`). If it is missing or its `version`
> is not `0.7.0`, stop and tell the owner to run `$thasmorato-skills:tm-setup`, then this stage again.
> Plugin subagents carry the `tm-` prefix: their `agent_type` is `tm-` followed by the agent's name.

**Argument** (the text after the skill name): (none): detected from the repo; re-run when the stack changes


Call the `spawn_agent` tool with `agent_type = "tm-guideline-generator"` to generate `docs/guidelines.md` and `docs/parallel-sessions.md` for this project.

The output is a **router**: which guide covers which files, where the project's documents are, and what the repo's real commands are. The depth per technology lives in `.claude/skills/<tech>-guide/`; generate those with `$thasmorato-skills:tm-generate-stack-guide <tech>`.

After the agent returns, show: the detected stack, the routing table, the rules and the `CLAUDE.md` / `AGENTS.md` pointers it wrote (and any it proposed instead of writing over the owner's own), the instruction sentinel (written, kept, or which root file is missing, so no stage can show it read that one), which technologies have a guide and which are marked missing, the commands it found, and the final line count. Then offer to run `$thasmorato-skills:tm-generate-stack-guide` for each missing technology.

For every row of `docs/parallel-sessions.md` marked `to be established`, ask the owner (read the `asking` skill (`references/skills/asking/index.md`) first), one structured question per row with what the repo suggests as the options, and write each answer into the page. A project that will never run two sessions at once is answered once, and the page says so.

The router's `Seed`, `Reset the data` and test account rows marked `to be established` are asked the same way, one question each, and the answer goes into the router: a password is answered with where it comes from, never its value.

This is a generate-once document; re-run it when the stack changes, not per feature.
