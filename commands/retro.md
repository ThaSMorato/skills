---
description: Look back over a finished epic, feature or cycle from what it left on disk — plans, validations, progress notes, reviews — and record what it taught about the process and the product.
argument-hint: <epic, feature slug, or a set of ticket ids>
---

Use the `retro` skill over: $ARGUMENTS

> Load the `asking` skill before you report or ask: resolve every id to what it means, offer a structured choice where the answer is a closed set, and ask only what is genuinely a decision.

## Preflight
Resolve the scope to its tickets under `.scratch/`. At least one must have a `progress.md` marked `completed` — a retro over unfinished work reads the plan, not the outcome. If nothing finished, say so and stop.

If no review files exist under `.scratch/<slug>/reviews/`, note it: those tickets were reviewed before `/review` began persisting its findings, so that lens is missing from this retro rather than empty.

## Postflight
Show:
- **planned versus done** per ticket, and the divergences the artifacts explain;
- **which gate categories actually fired**, from the `Resolved` sections of each `validation.md` — this is the closest thing the suite has to a measurement of which mistakes this project makes;
- **where the loop escalated** — three-attempt fix limits, failed deliverables;
- **findings that repeat across tickets**, with their instances, since repetition is what turns an incident into a standard worth moving into a guide;
- the product findings appended to `docs/evolutions.md`;
- **what the artifacts couldn't tell you** — say this out loud rather than letting the document imply it covered everything.

Then ask what to act on. This stage records; the stages that own the files make the changes.

## Where it sits
After a set of tickets completes — the end of an epic, or the end of a cycle if you work in fixed cycles. It is not per-ticket: a single ticket has no repetition to find, and repetition is most of the value here.
