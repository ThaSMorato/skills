---
name: tm-flow-report
description: 'Gather what several projects learned about the plugin itself: their flow-tagged retro and session findings grouped by the stage they would change, and the flow measurements per plugin version, ranked into proposals for the next version.'
argument-hint: "<project paths, or a file listing them one per line>"
user-invocable: false
---

Load skill `thasmorato-skills:flow-report` for: the owner's supplied arguments

> Load skill `thasmorato-skills:asking` before you report or ask: resolve every id to what it means, offer a structured choice where the answer is a closed set, and ask only what is genuinely a decision.

Preflight: at least one project path resolves. A project with no `docs/retro/` and no `docs/meta-retro/` is listed as not read, not an error; if none has either, say so: run `/tm-retro` or `/tm-session-analyze` in them first.

Postflight: the report's path, the findings repeated across projects (the proposals), the measurement directions per version with their ticket counts, and what could not be told. Then ask which proposals enter the next version's backlog.

## Stage boundary
Deliver this stage's artifact, name the next command as a recommendation to the owner, and stop the turn. Never invoke another stage, repeat this stage, or ask another agent/harness to perform the next stage. A dirty verdict is a report, never an automatic fix/revalidate loop. Only `/tm-flow` may coordinate transitions, each after an explicit owner gate. A subagent does its assigned work itself and never delegates again.

## Codex adapter (generated)
Load core skills by opening their SKILL.md from this plugin, stripping `thasmorato-skills:` from the logical name. For delegation use the available spawn tool with the named agent's instructions from `../../agent-specs/<name>.md`; if the client has registered the generated TOML agents, use those. Parallelize independent read-only lenses within the host concurrency limit, queueing remaining lenses. A subagent never delegates again. If delegation is unavailable, disclose that and execute each requested lens serially, preserving separate evidence. Never silently drop a lens. Use numbered choices if the host has no wizard.
