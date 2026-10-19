---
description: Make working code simple, Beck's four rules of Simple Design in order (expression, then duplication, then size), as structural changes with the tests untouched and green. After /tm-review on a ticket's diff, or on any path that has tests covering it.
argument-hint: "<ticket slug> <fixed point (the same one /tm-review used)>  |  <path>"
---

Load skill `thasmorato-skills:tidy` for: $ARGUMENTS

> Load skill `thasmorato-skills:asking` before you report or ask: resolve every id to what it means, offer a structured choice where the answer is a closed set, and ask only what is genuinely a decision.

Preflight, by mode:
- **Ticket** (`<slug> <fixed point>`): the ticket has a review file under `.scratch/<feature-slug>/reviews/`. Tidying before the review mixes two questions, *is it right?* and *is it simple?*, and the answer to the first can change the code the second would tidy. If there is no review, point at `/tm-review` and stop.
- **Path** (`<path>`): name the tests that cover the code under the path and run them; they must be green. If nothing covers it, say so and stop: there is no oracle for "behavior kept". Suggest covering it first.

Show the proposals grouped by rule, in rule order, each with its evidence. Ask which to apply. Then apply them one at a time, reporting per tidying: applied, or reverted and why. Then review the tidying diff alone with `review-spec` and `review-quality`, and revert any tidying a kept finding points at.

Postflight (ticket mode): the tidyings applied and reverted, and the next steps: the optional `/tm-walkthrough <slug> <fixed point>`, then `/tm-pr <slug> <fixed point>` for the pull request body.

## Stage boundary
Deliver this stage's artifact, name the next command as a recommendation to the owner, and stop the turn. Never invoke another stage, repeat this stage, or ask another agent/harness to perform the next stage. A dirty verdict is a report, never an automatic fix/revalidate loop. Only `/tm-flow` may coordinate transitions, each after an explicit owner gate. A subagent does its assigned work itself and never delegates again.
