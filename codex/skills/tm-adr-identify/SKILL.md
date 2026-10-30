---
name: tm-adr-identify
description: "Sweep the design docs (HLD/FDD/boundaries) for architectural decisions that merit an ADR, proposing Potential ADRs."
---

> **Codex.** Paths that start with `references/` are inside this skill's folder (the folder of this `SKILL.md`);
> in a shell command, write them as absolute paths. A stage named `$thasmorato-skills:tm-<name>` is another entry
> of this plugin: tell the owner to run it, never run it yourself.

> **Codex setup.** This stage spawns plugin subagents. Before anything else, read
> `~/.codex/thasmorato-skills.json` (or `$CODEX_HOME/thasmorato-skills.json`). If it is missing or its `version`
> is not `0.7.0`, stop and tell the owner to run `$thasmorato-skills:tm-setup`, then this stage again.
> Plugin subagents carry the `tm-` prefix: their `agent_type` is `tm-` followed by the agent's name.

**Argument** (the text after the skill name): (optional) modules/paths to focus on, or --brownfield to analyze the codebase and git history


Call the `spawn_agent` tool with `agent_type = "tm-adr-analyzer"` to sweep the design docs for ADR-worthy decisions and write Potential ADRs under `docs/adr/potential/`. Focus: the text after the skill name

If neither `docs/architecture/hld.md` nor `docs/features/*/fdd.md` exists (and this isn't a `--brownfield` run), tell the user to run `$thasmorato-skills:tm-hld` or `$thasmorato-skills:tm-fdd` first.

After the agent returns, show a short summary: the Potential ADRs found (with their Step-0 category or 3-E justification), which came from re-examining the brief's recorded decisions, and any `> Needs Input`.

Then ask the user which to formalize with `$thasmorato-skills:tm-adr-generate`. For the ones they reject, set `state: rejected` in the Potential's frontmatter with a one-line reason: a rejection that is not recorded gets re-proposed on the next sweep, and the sweep stops being trusted.
