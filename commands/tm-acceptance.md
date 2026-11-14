---
description: 'Check every acceptance criterion and every part of the owner''s request in the running software (by an agent that did not write the code: browser on the real controls, an HTTP request, a command, a measurement, a named test, or not verified with the reason) after the last change, and record it for /tm-pr.'
argument-hint: "<ticket slug>"
disable-model-invocation: true
---

Read `${CLAUDE_PLUGIN_ROOT}/skills/acceptance/SKILL.md` and follow it for: $ARGUMENTS

> Call the Skill tool with `thasmorato-skills:asking` before you report or ask: resolve every id to what it means, offer a structured choice where the answer is a closed set, and ask only what is genuinely a decision.

Preflight: the ticket's `progress.md` has `status: completed` and a review file exists for it. Run this after the review fixes and `/tm-tidy`, because a later change to production code makes the record stale.

Postflight: one line per AC first, then the path to the acceptance file, the counts by verdict, the `capture only` verdicts, the means provided and whether each was put back, every failure and every item not verified (each quoted), the criteria absorbed into the feature's docs (each with the rule it became and its test) or still waiting on other tickets, and the next step, `/tm-walkthrough` or `/tm-pr`.
