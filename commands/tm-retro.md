---
description: Look back over a finished epic, feature or cycle from what it left on disk (plans, validations, progress notes, reviews) and record what it taught about the process and the product.
argument-hint: "<epic, feature slug, or a set of ticket ids>"
---

Load skill `thasmorato-skills:retro` over: $ARGUMENTS

> Load skill `thasmorato-skills:asking` before you report or ask: resolve every id to what it means, offer a structured choice where the answer is a closed set, and ask only what is genuinely a decision.

## Preflight
Resolve the scope to its tickets under `.scratch/`. At least one must have a `progress.md` with `status: completed` (or, in one that predates the frontmatter, `**Status:** completed` in the body); a retro over unfinished work reads the plan, not the outcome. If nothing finished, say so and stop.

If no review files exist under `.scratch/<slug>/reviews/`, note it: those tickets were reviewed before `/tm-review` began persisting its findings, so that lens is missing from this retro rather than empty.

## Postflight
Show:
- **the measurements**: per ticket and by gear, from frontmatter, beside the previous retro's totals;
- **planned versus done** per ticket, and the divergences the artifacts explain;
- **which gate categories actually fired**, summed from each `validation.md`'s `fired`, the record of which mistakes this project actually makes;
- **where the loop escalated**: three-attempt fix limits, failed deliverables;
- **findings that repeat across tickets**, with their instances, since repetition is what turns an incident into a standard worth moving into a guide;
- **the environment, as far as the artifacts show it**: the repo's guardrail (or its absence), the mechanical standards the review kept catching (each proposed as a check), and the meta-retros' Environment sections, or that no session was analyzed;
- **the measurements per plugin version**, and every process change tagged `flow` (plugin), `repo-skill` (local conventions) or `repo-code` (code/config); the `flow` ones are what `/tm-flow-report` gathers across projects;
- the product findings appended to `docs/evolutions.md`;
- **what the artifacts couldn't tell you**: say this out loud rather than letting the document imply it covered everything.

Show the findings by level and stop.

## Where it sits
After a set of tickets completes: the end of an epic, or the end of a cycle if you work in fixed cycles. It is not per-ticket: a single ticket has no repetition to find, and repetition is most of the value here.

## Stage boundary
Deliver this stage's artifact, name the next command as a recommendation to the owner, and stop the turn. Never invoke another stage, repeat this stage, or ask another agent/harness to perform the next stage. A dirty verdict is a report, never an automatic fix/revalidate loop. Only `/tm-flow` may coordinate transitions, each after an explicit owner gate. A subagent does its assigned work itself and never delegates again.

## Harness adapter (generated)
In Claude Code, load a named plugin skill through the Skill tool with its fully qualified `thasmorato-skills:<name>`. Delegate a named subagent through the Agent tool. Never resolve a bare skill name from another plugin. Use AskUserQuestion when available, otherwise numbered options. Relative plugin paths in the source are relative to that source file, not the project cwd.
