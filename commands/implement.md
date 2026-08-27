---
description: Execute a validated plan one SI at a time — test-first (red → green → refactor), run the SI's tests, then STOP before the next SI.
argument-hint: <plan slug> [continuous]
---

Use the `implement` skill to build the plan: $ARGUMENTS

Resolve the plan under `.scratch/<feature-slug>/plans/`, run preflight (validation must be `clean`, branch must be set up), and execute SI by SI: red → green → refactor (production **and** tests), run the SI's tests, record progress, then STOP and wait for the user — unless they asked for continuous mode.

Default is to pause after every SI so the user can `/compact` and resume by re-running this command. When done, hand off to `/review` before any commit.
