---
name: tm-ui-audit
description: 'Evaluate an existing screen in the running software and list its problems with evidence and severity: an isolated design critique, a technical pass and a worst-case data run. Reports; never edits.'
argument-hint: "<screen: a route, URL or name>"
user-invocable: false
---

Load skill `thasmorato-skills:ui-audit` for: the owner's supplied arguments

> Load skill `thasmorato-skills:asking` before you report or ask: resolve every id to what it means, offer a structured choice where the answer is a closed set, and ask only what is genuinely a decision.

Preflight: the screen is named and can run (a route or URL the dev server serves). With no running server and no way to start one, stop and say so: an audit from the code alone is a guess about what the user sees.

Postflight: the path to `audit.md` and the HTML report (opened), the heuristics score, the counts by severity, the P0 and P1 findings resolved to their words, the strengths, what was not covered, and the next step: `/tm-ui-design <screen>` or a ticket per fix.

## Stage boundary
Deliver this stage's artifact, name the next command as a recommendation to the owner, and stop the turn. Never invoke another stage, repeat this stage, or ask another agent/harness to perform the next stage. A dirty verdict is a report, never an automatic fix/revalidate loop. Only `/tm-flow` may coordinate transitions, each after an explicit owner gate. A subagent does its assigned work itself and never delegates again.

## Codex adapter (generated)
Load core skills by opening their SKILL.md from this plugin, stripping `thasmorato-skills:` from the logical name. For delegation use the available spawn tool with the named agent's instructions from `../../agent-specs/<name>.md`; if the client has registered the generated TOML agents, use those. Parallelize independent read-only lenses within the host concurrency limit, queueing remaining lenses. A subagent never delegates again. If delegation is unavailable, disclose that and execute each requested lens serially, preserving separate evidence. Never silently drop a lens. Use numbered choices if the host has no wizard.
