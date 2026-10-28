---
name: tm-tidy
description: "Make working code simple, Beck's four rules of Simple Design in order (expression, then duplication, then size), as structural changes with the tests untouched and green. After $thasmorato-skills:tm-review on a ticket's diff, or on any path that has tests covering it."
---

> **Codex.** Paths that start with `references/` are inside this skill's folder (the folder of this `SKILL.md`);
> in a shell command, write them as absolute paths. A stage named `$thasmorato-skills:tm-<name>` is another entry
> of this plugin: tell the owner to run it, never run it yourself.

> **Codex setup.** This stage spawns plugin subagents. Before anything else, read
> `~/.codex/thasmorato-skills.json` (or `$CODEX_HOME/thasmorato-skills.json`). If it is missing or its `version`
> is not `0.7.0`, stop and tell the owner to run `$thasmorato-skills:tm-setup`, then this stage again.
> Plugin subagents carry the `tm-` prefix: their `agent_type` is `tm-` followed by the agent's name.

**Argument** (the text after the skill name): <ticket slug> <fixed point (the same one $thasmorato-skills:tm-review used)>  |  <path>


Read `references/skills/tidy/index.md` and follow it for: the text after the skill name

> Read the `asking` skill (`references/skills/asking/index.md`) before you report or ask: resolve every id to what it means, offer a structured choice where the answer is a closed set, and ask only what is genuinely a decision.

Preflight, by mode:
- **Ticket** (`<slug> <fixed point>`): the ticket has a review file under `.scratch/<feature-slug>/reviews/`. Tidying before the review mixes two questions, *is it right?* and *is it simple?*, and the answer to the first can change the code the second would tidy. If there is no review, point at `$thasmorato-skills:tm-review` and stop.
- **Path** (`<path>`): name the tests that cover the code under the path and run them; they must be green. If nothing covers it, say so and stop: there is no oracle for "behavior kept". Suggest covering it first.

Show the proposals grouped by rule, in rule order, each with its evidence. Ask which to apply. Then apply them one at a time, reporting per tidying: applied, or reverted and why. Then review the tidying diff alone with `review-spec` and `review-quality`, and revert any tidying a kept finding points at.

Postflight (ticket mode): the tidyings applied and reverted, and the next steps: the optional `$thasmorato-skills:tm-walkthrough <slug> <fixed point>`, then `$thasmorato-skills:tm-pr <slug> <fixed point>` for the pull request body.
