---
description: Audit a whole test suite (or a path) for missing and useless tests, with mutation over the suite at the report level; report only, remove with your confirmation, or also write the missing tests.
argument-hint: "<path> [report | confirm | full]  (default: the test roots, report)"
disable-model-invocation: true
---

Read `${CLAUDE_PLUGIN_ROOT}/skills/test-audit/SKILL.md` and follow it for: $ARGUMENTS

> Call the Skill tool with `thasmorato-skills:asking` before you report or ask: resolve every id to what it means, offer a structured choice where the answer is a closed set, and ask only what is genuinely a decision.

Preflight: run the scope's suite once through the `test-runner` agent. A red suite cannot be audited (a removal or an addition cannot be shown to keep it green): report what fails and stop. Name the level that will run, and that only `confirm` and `full` change files.

Postflight: the path to `docs/analysis/test-audit.md`, the counts (absent, excess, mutants), what was removed or added, and what was proposed and not applied.
