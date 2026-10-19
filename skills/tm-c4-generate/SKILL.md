---
name: tm-c4-generate
description: Generate C4 diagrams (PlantUML); C1/C2 from the HLD, the system C3 from the component map, C3/C4 per feature from the FDD.
argument-hint: "(optional) feature name for the feature-level diagrams; omit for the system levels"
user-invocable: false
---

Delegate to subagent `c4-generator` to generate C4 PlantUML diagrams into `docs/c4/`:

- **System levels** from `docs/arquitetura/hld.md` (C1, C2) and `docs/arquitetura/components.md` (C3).
- **Feature levels** for the owner's supplied arguments from `docs/features/<feature>/fdd.md` (C3, and C4 where code-level detail exists).

If neither the HLD nor an FDD exists, tell the user to run `/tm-hld` or `/tm-fdd` first. If the HLD exists but `docs/arquitetura/components.md` does not, note that the system C3 will be skipped and that `/tm-components` produces its source.

After the agent returns, show which C4 levels were generated and which were skipped (with the reason), and the output paths.

## Stage boundary
Deliver this stage's artifact, name the next command as a recommendation to the owner, and stop the turn. Never invoke another stage, repeat this stage, or ask another agent/harness to perform the next stage. A dirty verdict is a report, never an automatic fix/revalidate loop. Only `/tm-flow` may coordinate transitions, each after an explicit owner gate. A subagent does its assigned work itself and never delegates again.

## Codex adapter (generated)
Load core skills by opening their SKILL.md from this plugin, stripping `thasmorato-skills:` from the logical name. For delegation use the available spawn tool with the named agent's instructions from `../../agent-specs/<name>.md`; if the client has registered the generated TOML agents, use those. Parallelize independent read-only lenses within the host concurrency limit, queueing remaining lenses. A subagent never delegates again. If delegation is unavailable, disclose that and execute each requested lens serially, preserving separate evidence. Never silently drop a lens. Use numbered choices if the host has no wizard.
