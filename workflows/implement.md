---
description: Execute a validated plan one SI at a time, test-first (red → green → refactor), run the SI's tests, then STOP before the next SI.
argument-hint: "<plan slug> [continuous]"
---

Load skill `thasmorato-skills:implement` to build the plan: $ARGUMENTS

Resolve the plan under `.scratch/<feature-slug>/plans/`, run preflight (validation must be `clean`, branch must be set up), and execute SI by SI: red → green → refactor (production **and** tests), run the SI's tests, record progress, then STOP and wait for the user, unless they asked for continuous mode.

Default is to pause after every SI so the user can `/compact` and resume by re-running this command. When done, hand off to `/tm-review` before any commit.

## Stage boundary
Deliver this stage's artifact, name the next command as a recommendation to the owner, and stop the turn. Never invoke another stage, repeat this stage, or ask another agent/harness to perform the next stage. A dirty verdict is a report, never an automatic fix/revalidate loop. Only `/tm-flow` may coordinate transitions, each after an explicit owner gate. A subagent does its assigned work itself and never delegates again.
