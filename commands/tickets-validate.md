---
description: Validate a feature's ticket set before the human gate — coverage, invention, tickets too big or too small, several tickets on one seam, blocking cycles, dispersion — with a clean/dirty verdict.
argument-hint: "<feature name or slug>"
---

Use the `tickets-validate` skill to validate the tickets for: $ARGUMENTS

> Load the `asking` skill before you report or ask: resolve every id to what it means, offer a structured choice where the answer is a closed set, and ask only what is genuinely a decision.

`/tickets` runs this on its own as its postflight. Run it directly after editing tickets by hand.

After it returns, show the verdict, the **tickets-to-seams count** first (it is the one number that shows an over-split set at a glance), then the open findings: merges and splits before the rest, each ticket named by number and title.

If `dirty`, the fix belongs to `/tickets`, or to a hand edit of the ticket files. Then re-run this.
