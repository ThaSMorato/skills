---
description: After /review, make a ticket's code simple — Beck's four rules of Simple Design in order (expression, then duplication, then size), proposed with evidence, applied only where you choose, as structural changes with the tests untouched and green.
argument-hint: "<ticket slug> <fixed point — the same one /review used>"
---

Use the `tidy` skill for: $ARGUMENTS

> Load the `asking` skill before you report or ask: resolve every id to what it means, offer a structured choice where the answer is a closed set, and ask only what is genuinely a decision.

Preflight: the ticket has a review file under `.scratch/<feature-slug>/reviews/`. Tidying before the review mixes two questions, *is it right?* and *is it simple?*, and the answer to the first can change the code the second would tidy. If there is no review, point at `/review` and stop.

Show the proposals grouped by rule, in rule order, each with its evidence. Ask which to apply. Then apply them one at a time, reporting per tidying: applied, or reverted and why.
