---
description: 'Check every acceptance criterion and every part of the owner''s request in the running software (browser and screenshot, a named test, or not verified with the reason) after the last change, and record it for /pr.'
argument-hint: "<ticket slug>"
---

Call the Skill tool with `acceptance` for: $ARGUMENTS

> Call the Skill tool with `asking` before you report or ask: resolve every id to what it means, offer a structured choice where the answer is a closed set, and ask only what is genuinely a decision.

Preflight: the ticket's `progress.md` has `status: completed` and a review file exists for it. Run this after the review fixes and `/tidy`, because a later change to production code makes the record stale.

Postflight: the path to the acceptance file, the counts by verdict, every failure and every item not verified (each quoted), and the next step, `/walkthrough` or `/pr`.
