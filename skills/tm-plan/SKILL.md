---
name: tm-plan
description: Break one ticket into a validated implementation plan, vertical SIs with tests, dependencies, and acceptance criteria.
argument-hint: "<ticket file/number, or the work to plan>"
user-invocable: false
---

Load skill `thasmorato-skills:ticket-plan` to turn this into an implementation plan: the owner's supplied arguments

Read the ticket (or the work the user points to) plus the node map, the FDD, the boundary contract, ADRs, guidelines, and `docs/produto/glossario.md`.

**Preflight:** the node map must exist at `.scratch/<feature-slug>/design/<NN>-<slug>.md`. If it doesn't, stop and tell the user to run `/tm-design <ticket>` first; designing inside this command collapses two gates into one and leaves the design contract unwritten.

Slice the work into vertical Step Implementations, coarse by default (1 to 3 at small gear), each acceptance criterion owned by id, confirm the granularity and seams with the user (record their choice in `## Slicing`), and write the plan to `.scratch/<feature-slug>/plans/<NN>-<slug>/plan.md`.

Then tell the user to run `/tm-plan-validate <slug>` before implementing.

## Stage boundary
Deliver this stage's artifact, name the next command as a recommendation to the owner, and stop the turn. Never invoke another stage, repeat this stage, or ask another agent/harness to perform the next stage. A dirty verdict is a report, never an automatic fix/revalidate loop. Only `/tm-flow` may coordinate transitions, each after an explicit owner gate. A subagent does its assigned work itself and never delegates again.

## Codex adapter (generated)
Load core skills by opening their SKILL.md from this plugin, stripping `thasmorato-skills:` from the logical name. For delegation use the available spawn tool with the named agent's instructions from `../../agent-specs/<name>.md`; if the client has registered the generated TOML agents, use those. Parallelize independent read-only lenses within the host concurrency limit, queueing remaining lenses. A subagent never delegates again. If delegation is unavailable, disclose that and execute each requested lens serially, preserving separate evidence. Never silently drop a lens. Use numbered choices if the host has no wizard.
