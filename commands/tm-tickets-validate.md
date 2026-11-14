---
description: Validate a feature's ticket set before the human gate (coverage, invention, tickets too big or too small, several tickets on one seam, blocking cycles, dispersion), with a clean/dirty verdict.
argument-hint: "<feature name or slug>"
disable-model-invocation: true
---

Read `${CLAUDE_PLUGIN_ROOT}/skills/tickets-validate/SKILL.md` and follow it to validate the tickets for: $ARGUMENTS

> Call the Skill tool with `thasmorato-skills:asking` before you report or ask: resolve every id to what it means, offer a structured choice where the answer is a closed set, and ask only what is genuinely a decision.

The owner runs this after `/tm-tickets`, which names it and never runs it, and again after editing tickets by hand.

After it returns, show the verdict, the **tickets-to-seams count** first (it is the one number that shows an over-split set at a glance), then the open findings: merges and splits before the rest, each ticket named by number and title.

If `dirty`, the fix belongs to `/tm-tickets`, or to a hand edit of the ticket files. Then re-run this.
