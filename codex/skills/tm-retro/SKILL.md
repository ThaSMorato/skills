---
name: tm-retro
description: "Look back over a finished epic, feature or cycle from what it left on disk (plans, validations, progress notes, reviews) and record what it taught about the process and the product."
---

> **Codex.** Paths that start with `references/` are inside this skill's folder (the folder of this `SKILL.md`);
> in a shell command, write them as absolute paths. A stage named `$thasmorato-skills:tm-<name>` is another entry
> of this plugin: tell the owner to run it, never run it yourself.

**Argument** (the text after the skill name): <epic, feature slug, or a set of ticket ids>


Read the `retro` skill (`references/skills/retro/SKILL.md`) over: the text after the skill name

> Read the `asking` skill (`references/skills/asking/SKILL.md`) before you report or ask: resolve every id to what it means, offer a structured choice where the answer is a closed set, and ask only what is genuinely a decision.

## Preflight
Resolve the scope to its tickets under `.scratch/`. At least one must have a `progress.md` with `status: completed` (or, in one that predates the frontmatter, `**Status:** completed` in the body); a retro over unfinished work reads the plan, not the outcome. If nothing finished, say so and stop.

If no review files exist under `.scratch/<slug>/reviews/`, note it: those tickets were reviewed before `$thasmorato-skills:tm-review` began persisting its findings, so that lens is missing from this retro rather than empty.

## Postflight
Show:
- **the measurements**: per ticket and by gear, from frontmatter, beside the previous retro's totals;
- **planned versus done** per ticket, and the divergences the artifacts explain;
- **which gate categories actually fired**, summed from each `validation.md`'s `fired`, the record of which mistakes this project actually makes;
- **where the loop escalated**: three-attempt fix limits, failed deliverables;
- **findings that repeat across tickets**, with their instances, since repetition is what turns an incident into a standard worth moving into a guide;
- **the environment, as far as the artifacts show it**: the repo's guardrail (or its absence), the mechanical standards the review kept catching (each proposed as a check), and the meta-retros' Environment sections, or that no session was analyzed;
- **the measurements per plugin version**, and every process change tagged `flow` (the plugin's) or `project` (this repo's); the `flow` ones are what `$thasmorato-skills:tm-flow-report` gathers across projects;
- the product findings appended to `docs/evolutions.md`;
- **what the artifacts couldn't tell you**: say this out loud rather than letting the document imply it covered everything.

Then ask what to act on. This stage records; the stages that own the files make the changes.

## Where it sits
After a set of tickets completes: the end of an epic, or the end of a cycle if you work in fixed cycles. It is not per-ticket: a single ticket has no repetition to find, and repetition is most of the value here.
