---
description: 'Write a ticket''s pull request body from what the work left on disk: a summary drawn as the smallest view, before-and-after evidence, and the merge danger (one-way or two-way door, blast radius).'
argument-hint: "<ticket slug> <fixed point, the one /tm-review used>"
---

Load skill `thasmorato-skills:pr` for: $ARGUMENTS

> Load skill `thasmorato-skills:asking` before you report or ask: resolve every id to what it means, offer a structured choice where the answer is a closed set, and ask only what is genuinely a decision.

Preflight: the ticket's `progress.md` has `status: completed`, and a review file exists for it. A PR body written before the review cannot say what the review found; point at `/tm-review` and stop. If `/tm-tidy` has not run, say so and go on: it is optional.

Postflight: the path to `pr.md`, the door and the blast radius in one line, and anything listed as not verified. Then ask whether to open the pull request; open it only on a yes.

## Stage boundary
Deliver this stage's artifact, name the next command as a recommendation to the owner, and stop the turn. Never invoke another stage, repeat this stage, or ask another agent/harness to perform the next stage. A dirty verdict is a report, never an automatic fix/revalidate loop. Only `/tm-flow` may coordinate transitions, each after an explicit owner gate. A subagent does its assigned work itself and never delegates again.

## Harness adapter (generated)
In Claude Code, load a named plugin skill through the Skill tool with its fully qualified `thasmorato-skills:<name>`. Delegate a named subagent through the Agent tool. Never resolve a bare skill name from another plugin. Use AskUserQuestion when available, otherwise numbered options. Relative plugin paths in the source are relative to that source file, not the project cwd.
