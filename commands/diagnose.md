---
description: Find the cause of a bug by evidence — reproduce, three hypotheses of different kinds, evidence for and against, one discriminating probe at a time — and pin it with tests before anything is fixed.
argument-hint: "<the symptom — a failing test, an error, a bug report, or a ticket>"
---

Use the `diagnose` skill for: $ARGUMENTS

> Load the `asking` skill before you report or ask: resolve every id to what it means, offer a structured choice where the answer is a closed set, and ask only what is genuinely a decision.

Preflight: there is a symptom to start from, concrete enough to try to reproduce: a failing test, an error with its text, a bug report with steps, or a ticket. If there is only "it's broken", ask for the one thing that lets you reproduce it (where, doing what, seeing what).

Report as you go, at each probe: which hypotheses are alive, what the probe could tell apart, and what it showed. Ask the owner only for what the repository cannot answer: the expected behavior when the spec is silent, access to an environment, the data that triggered it.

Postflight:
- **Cause found:** the cause at `file:line`, the pinned and flipped tests per level, and the next step. For a fix whose shape is now obvious, fix it test-first with the `tdd` skill (Direct gear). Otherwise write a ticket with `Type: bugfix` whose Source is this diagnosis, and take it through `/design` → `/plan` in the Small gear.
- **Unresolved:** the critical unknown and the probe that would settle it. Don't present a best guess as a cause.
