---
description: 'Teach the owner the change the AI built before it merges: an HTML lesson over the ticket''s diff (what it does, where it lives, the path per acceptance criterion, what can go wrong) with a recall quiz, then re-explain what was missed.'
argument-hint: "<ticket slug> <fixed point, the one /review used>"
---

Call the Skill tool with `walkthrough` for: $ARGUMENTS

> Call the Skill tool with `asking` before you report or ask: resolve every id to what it means, offer a structured choice where the answer is a closed set, and ask only what is genuinely a decision.

Preflight: the ticket's `progress.md` has `status: completed`, the fixed point resolves, and the diff is non-empty. A review file should exist; without one, say that the lesson cannot include what the review accepted, and go on.

Postflight: the lesson's path (opened), the quiz result after the owner answers (missed, still unclear), what was decided for anything still unclear, and the next step, `/pr <slug> <fixed point>`.
