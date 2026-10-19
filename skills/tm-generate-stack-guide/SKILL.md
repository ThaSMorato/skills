---
name: tm-generate-stack-guide
description: Generate a per-technology engineering guide skill (conventions, idioms, gotchas and security idioms for one language or framework), as a lazy-loaded router.
argument-hint: "<technology> (e.g. ruby, react, nestjs, go)"
user-invocable: false
---

Load skill `thasmorato-skills:generate-stack-guide` for: the owner's supplied arguments

Run all five phases: choose the source, mine it, confirm the calls with the user, generate `.claude/skills/<tech>-guide/`, and register the routing row in `docs/guias/guidelines.md`.

The unit is the **technology**, not the project: a Ruby + React repo gets two guides that compose, and each one is reusable in the next repo that uses that stack.

After it returns, show what was generated, which conventions came from the repo versus the external source, and any place the two disagreed.

## Stage boundary
Deliver this stage's artifact, name the next command as a recommendation to the owner, and stop the turn. Never invoke another stage, repeat this stage, or ask another agent/harness to perform the next stage. A dirty verdict is a report, never an automatic fix/revalidate loop. Only `/tm-flow` may coordinate transitions, each after an explicit owner gate. A subagent does its assigned work itself and never delegates again.

## Codex adapter (generated)
Load core skills by opening their SKILL.md from this plugin, stripping `thasmorato-skills:` from the logical name. For delegation use the available spawn tool with the named agent's instructions from `../../agent-specs/<name>.md`; if the client has registered the generated TOML agents, use those. Parallelize independent read-only lenses within the host concurrency limit, queueing remaining lenses. A subagent never delegates again. If delegation is unavailable, disclose that and execute each requested lens serially, preserving separate evidence. Never silently drop a lens. Use numbered choices if the host has no wizard.
