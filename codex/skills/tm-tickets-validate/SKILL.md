---
name: tm-tickets-validate
description: "Validate a feature's ticket set before the human gate (coverage, invention, tickets too big or too small, several tickets on one seam, blocking cycles, dispersion), with a clean/dirty verdict."
---

> **Codex.** Paths that start with `references/` are inside this skill's folder (the folder of this `SKILL.md`);
> in a shell command, write them as absolute paths. A stage named `$thasmorato-skills:tm-<name>` is another entry
> of this plugin: tell the owner to run it, never run it yourself.

**Argument** (the text after the skill name): <feature name or slug>


Read `references/skills/tickets-validate/index.md` and follow it to validate the tickets for: the text after the skill name

> Read the `asking` skill (`references/skills/asking/index.md`) before you report or ask: resolve every id to what it means, offer a structured choice where the answer is a closed set, and ask only what is genuinely a decision.

The owner runs this after `$thasmorato-skills:tm-tickets`, which names it and never runs it, and again after editing tickets by hand.

After it returns, show the verdict, the **tickets-to-seams count** first (it is the one number that shows an over-split set at a glance), then the open findings: merges and splits before the rest, each ticket named by number and title.

If `dirty`, the fix belongs to `$thasmorato-skills:tm-tickets`, or to a hand edit of the ticket files. Then re-run this.
