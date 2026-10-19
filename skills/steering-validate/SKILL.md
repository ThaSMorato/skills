---
name: steering-validate
description: Check repository instructions, scoped rules, stack guides and local skills for contradictory guidance before planning or implementation.
user-invocable: false
---

Read applicable CLAUDE.md, AGENTS.md, `.claude/rules`, stack/testing guides, guidelines and repo-local skills. Resolve path scopes including proposed files. Compare commands, host/container context, dependencies, naming, test seams and architectural constraints. Report only concrete incompatible instructions that apply to the same path/task, quoting both sources. A narrower intentional override is not a conflict when precedence is explicit.

Write `.scratch/steering-validation.md` with kind, plugin_version, harness, checked paths, findings and `status: clean | dirty`. Clean means no unresolved contradictions. Dirty is a report for the owner, never a trigger to edit rules or invoke another stage. Deliver the report, recommend the owner stage for each file and stop.

## Stage boundary
Deliver this stage's artifact, name the next command as a recommendation to the owner, and stop the turn. Never invoke another stage, repeat this stage, or ask another agent/harness to perform the next stage. A dirty verdict is a report, never an automatic fix/revalidate loop. Only `/tm-flow` may coordinate transitions, each after an explicit owner gate. A subagent does its assigned work itself and never delegates again.
