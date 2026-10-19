---
description: 'Check every acceptance criterion and every part of the owner''s request in the running software (browser and screenshot, a named test, or not verified with the reason) after the last change, and record it for /tm-pr.'
argument-hint: "<ticket slug>"
---

Load skill `thasmorato-skills:acceptance` for: $ARGUMENTS

> Load skill `thasmorato-skills:asking` before you report or ask: resolve every id to what it means, offer a structured choice where the answer is a closed set, and ask only what is genuinely a decision.

Preflight: the ticket's `progress.md` has `status: completed` and a review file exists for it. Run this after the review fixes and `/tm-tidy`, because a later change to production code makes the record stale.

Postflight: the path to the acceptance file, the counts by verdict, every failure and every item not verified (each quoted), and the next step, `/tm-walkthrough` or `/tm-pr`.

## Stage boundary
Deliver this stage's artifact, name the next command as a recommendation to the owner, and stop the turn. Never invoke another stage, repeat this stage, or ask another agent/harness to perform the next stage. A dirty verdict is a report, never an automatic fix/revalidate loop. Only `/tm-flow` may coordinate transitions, each after an explicit owner gate. A subagent does its assigned work itself and never delegates again.

## Harness adapter (generated)
In Claude Code, load a named plugin skill through the Skill tool with its fully qualified `thasmorato-skills:<name>`. Delegate a named subagent through the Agent tool. Never resolve a bare skill name from another plugin. Use AskUserQuestion when available, otherwise numbered options. Relative plugin paths in the source are relative to that source file, not the project cwd.
