---
description: 'Teach the owner the change the AI built before it merges: an HTML lesson over the ticket''s diff (what it does, where it lives, the path per acceptance criterion, what can go wrong) with a recall quiz, then re-explain what was missed.'
argument-hint: "<ticket slug> <fixed point, the one /tm-review used>"
---

Load skill `thasmorato-skills:walkthrough` for: $ARGUMENTS

> Load skill `thasmorato-skills:asking` before you report or ask: resolve every id to what it means, offer a structured choice where the answer is a closed set, and ask only what is genuinely a decision.

Preflight: the ticket's `progress.md` has `status: completed`, the fixed point resolves, and the diff is non-empty. A review file should exist; without one, say that the lesson cannot include what the review accepted, and go on.

Postflight: the lesson's path (opened), the quiz result after the owner answers (missed, still unclear), what was decided for anything still unclear, and the next step, `/tm-pr <slug> <fixed point>`.

## Stage boundary
Deliver this stage's artifact, name the next command as a recommendation to the owner, and stop the turn. Never invoke another stage, repeat this stage, or ask another agent/harness to perform the next stage. A dirty verdict is a report, never an automatic fix/revalidate loop. Only `/tm-flow` may coordinate transitions, each after an explicit owner gate. A subagent does its assigned work itself and never delegates again.

## Harness adapter (generated)
In Claude Code, load a named plugin skill through the Skill tool with its fully qualified `thasmorato-skills:<name>`. Delegate a named subagent through the Agent tool. Never resolve a bare skill name from another plugin. Use AskUserQuestion when available, otherwise numbered options. Relative plugin paths in the source are relative to that source file, not the project cwd.
