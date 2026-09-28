---
description: After /review, make a ticket's change smaller — cut hunks no SI or AC asked for, reuse what the repo already has, drop files and layers the change did not need, pull a spread-out behavior into fewer files. Proposed with evidence, applied only where you choose.
argument-hint: "<ticket slug> <fixed point — the same one /review used>"
---

Use the `trim` skill for: $ARGUMENTS

> Load the `asking` skill before you report or ask: resolve every id to what it means, offer a structured choice where the answer is a closed set, and ask only what is genuinely a decision.

Preflight: the ticket has a review file under `.scratch/<feature-slug>/reviews/`. Trimming before the review means cutting code before anyone judged whether it is right, and a review finding can move the code a cut would target. If there is no review, point at `/review` and stop. Then confirm the fixed point resolves and the diff is non-empty.

Show the diff's size, then the proposals grouped by criterion, in criterion order, each with its evidence and marked `structural` or `behavioral`. Ask which to apply. Then apply them one at a time, reporting per cut: applied, or reverted and why.

Postflight: the diff's size before and after, the behavioral cuts listed so the user can turn any of them into a ticket, and the next step, `/tidy <slug> <fixed point>`.
