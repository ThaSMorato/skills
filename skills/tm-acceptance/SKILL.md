---
name: tm-acceptance
description: 'Check every acceptance criterion and every part of the owner''s request in the running software (browser and screenshot, a named test, or not verified with the reason) after the last change, and record it for /tm-pr.'
argument-hint: "<ticket slug>"
user-invocable: false
---

Load skill `thasmorato-skills:acceptance` for: the owner's supplied arguments

> Load skill `thasmorato-skills:asking` before you report or ask: resolve every id to what it means, offer a structured choice where the answer is a closed set, and ask only what is genuinely a decision.

Preflight: the ticket's `progress.md` has `status: completed` and a review file exists for it. Run this after the review fixes and `/tm-tidy`, because a later change to production code makes the record stale.

Postflight: the path to the acceptance file, the counts by verdict, every failure and every item not verified (each quoted), and the next step, `/tm-walkthrough` or `/tm-pr`.

## Stage boundary
Deliver this stage's artifact, name the next command as a recommendation to the owner, and stop the turn. Never invoke another stage, repeat this stage, or ask another agent/harness to perform the next stage. A dirty verdict is a report, never an automatic fix/revalidate loop. Only `/tm-flow` may coordinate transitions, each after an explicit owner gate. A subagent does its assigned work itself and never delegates again.

## Codex adapter (generated)
Load core skills by opening their SKILL.md from this plugin, stripping `thasmorato-skills:` from the logical name. For delegation use the available spawn tool with the named agent's instructions from `../../agent-specs/<name>.md`; if the client has registered the generated TOML agents, use those. Parallelize independent read-only lenses within the host concurrency limit, queueing remaining lenses. A subagent never delegates again. If delegation is unavailable, disclose that and execute each requested lens serially, preserving separate evidence. Never silently drop a lens. Use numbered choices if the host has no wizard.
