---
description: Make working code simple — Beck's four rules of Simple Design in order (expression, then duplication, then size), as structural changes with the tests untouched and green. After /review on a ticket's diff, or on any path that has tests covering it.
argument-hint: "<ticket slug> <fixed point — the same one /review used>  |  <path>"
---

Use the `tidy` skill for: $ARGUMENTS

> Load the `asking` skill before you report or ask: resolve every id to what it means, offer a structured choice where the answer is a closed set, and ask only what is genuinely a decision.

Preflight, by mode:
- **Ticket** (`<slug> <fixed point>`): the ticket has a review file under `.scratch/<feature-slug>/reviews/`. Tidying before the review mixes two questions, *is it right?* and *is it simple?*, and the answer to the first can change the code the second would tidy. If there is no review, point at `/review` and stop.
- **Path** (`<path>`): name the tests that cover the code under the path and run them; they must be green. If nothing covers it, say so and stop: there is no oracle for "behavior kept". Suggest covering it first.

Show the proposals grouped by rule, in rule order, each with its evidence. Ask which to apply. Then apply them one at a time, reporting per tidying: applied, or reverted and why. Then review the tidying diff alone with `review-spec` and `review-quality`, and revert any tidying a kept finding points at.
