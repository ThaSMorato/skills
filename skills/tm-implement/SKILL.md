---
name: tm-implement
description: Execute a validated plan one SI at a time, test-first (red → green → refactor), run the SI's tests, then STOP before the next SI.
argument-hint: "<plan slug> [continuous]"
user-invocable: false
---

Load skill `thasmorato-skills:implement` to build the plan: the owner's supplied arguments

Resolve the plan under `.scratch/<feature-slug>/plans/`, run preflight (validation must be `clean`, branch must be set up), and execute SI by SI: red → green → refactor (production **and** tests), run the SI's tests, record progress, then STOP and wait for the user, unless they asked for continuous mode.

Default is to pause after every SI so the user can `/compact` and resume by re-running this command. When done, hand off to `/tm-review` before any commit.

## Stage boundary
Deliver this stage's artifact, name the next command as a recommendation to the owner, and stop the turn. Never invoke another stage, repeat this stage, or ask another agent/harness to perform the next stage. A dirty verdict is a report, never an automatic fix/revalidate loop. Only `/tm-flow` may coordinate transitions, each after an explicit owner gate. A subagent does its assigned work itself and never delegates again.

## Codex adapter (generated)
Load core skills by opening their SKILL.md from this plugin, stripping `thasmorato-skills:` from the logical name. For delegation use the available spawn tool with the named agent's instructions from `../../agent-specs/<name>.md`; if the client has registered the generated TOML agents, use those. Parallelize independent read-only lenses within the host concurrency limit, queueing remaining lenses. A subagent never delegates again. If delegation is unavailable, disclose that and execute each requested lens serially, preserving separate evidence. Never silently drop a lens. Use numbered choices if the host has no wizard.
