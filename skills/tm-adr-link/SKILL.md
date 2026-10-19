---
name: tm-adr-link
description: Maintain the ADR link graph (supersedes/amends inverses) and refresh the timeline index.
user-invocable: false
---

Delegate to subagent `adr-linker` to derive the bidirectional graph without editing `docs/adr/*.md` and regenerate `docs/adr/README.md` (timeline + graph).

If `docs/adr/` has no ADRs, tell the user to generate some first with `/tm-adr-generate`.

After the agent returns, show a short summary: inverse edges and effective statuses derived without changing an ADR, and the index location.

## Stage boundary
Deliver this stage's artifact, name the next command as a recommendation to the owner, and stop the turn. Never invoke another stage, repeat this stage, or ask another agent/harness to perform the next stage. A dirty verdict is a report, never an automatic fix/revalidate loop. Only `/tm-flow` may coordinate transitions, each after an explicit owner gate. A subagent does its assigned work itself and never delegates again.

## Codex adapter (generated)
Load core skills by opening their SKILL.md from this plugin, stripping `thasmorato-skills:` from the logical name. For delegation use the available spawn tool with the named agent's instructions from `../../agent-specs/<name>.md`; if the client has registered the generated TOML agents, use those. Parallelize independent read-only lenses within the host concurrency limit, queueing remaining lenses. A subagent never delegates again. If delegation is unavailable, disclose that and execute each requested lens serially, preserving separate evidence. Never silently drop a lens. Use numbered choices if the host has no wizard.
