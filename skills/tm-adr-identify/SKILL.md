---
name: tm-adr-identify
description: Sweep the design docs (HLD/FDD/boundaries) for architectural decisions that merit an ADR, proposing Potential ADRs.
argument-hint: "(optional) modules/paths to focus on, or --brownfield to analyze the codebase and git history"
user-invocable: false
---

Delegate to subagent `adr-analyzer` to sweep the design docs for ADR-worthy decisions and write Potential ADRs under `docs/adr/potential/`. Focus: the owner's supplied arguments

If neither `docs/arquitetura/hld.md` nor `docs/features/*/fdd.md` exists (and this isn't a `--brownfield` run), tell the user to run `/tm-hld` or `/tm-fdd` first.

After the agent returns, show a short summary: the Potential ADRs found (with their Step-0 category or 3-E justification), which came from re-examining the brief's recorded decisions, and any `> Needs Input`.

Then ask the user which to formalize with `/tm-adr-generate`. For the ones they reject, set `state: rejected` in the Potential's frontmatter with a one-line reason: a rejection that is not recorded gets re-proposed on the next sweep, and the sweep stops being trusted.

## Stage boundary
Deliver this stage's artifact, name the next command as a recommendation to the owner, and stop the turn. Never invoke another stage, repeat this stage, or ask another agent/harness to perform the next stage. A dirty verdict is a report, never an automatic fix/revalidate loop. Only `/tm-flow` may coordinate transitions, each after an explicit owner gate. A subagent does its assigned work itself and never delegates again.

## Codex adapter (generated)
Load core skills by opening their SKILL.md from this plugin, stripping `thasmorato-skills:` from the logical name. For delegation use the available spawn tool with the named agent's instructions from `../../agent-specs/<name>.md`; if the client has registered the generated TOML agents, use those. Parallelize independent read-only lenses within the host concurrency limit, queueing remaining lenses. A subagent never delegates again. If delegation is unavailable, disclose that and execute each requested lens serially, preserving separate evidence. Never silently drop a lens. Use numbered choices if the host has no wizard.
