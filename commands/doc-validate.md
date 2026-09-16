---
description: Validate a design document against the one it came from before the human gate — coverage both ways, contradictions, glossary drift, unanswered RNFs — with a clean/dirty verdict.
argument-hint: <from> <to> — e.g. "prd hld", or omit to validate every available pair
---

Use the `doc-validate` skill to check: $ARGUMENTS

> Load the `asking` skill before you report or ask: resolve every id to what it means, offer a structured choice where the answer is a closed set, and ask only what is genuinely a decision.

With no argument, validate every pair whose two documents exist: `brief → prd`, `prd → hld`, `prd → features`, `hld → components`, `features → fdd`.

Before delegating, confirm both sides of each pair exist — a missing target should fail here, with the name of the command that produces it, not inside the check.

After it returns, show for each pair: the verdict, the open issues most-severe first, and — first, because it is the one nothing else looks for — anything in the **coverage** category, where the source said something and the target dropped it.

If any pair is `dirty`, the fix goes back to the stage that wrote the document: re-run its command, or edit the file directly. Then re-run this. If everything is `clean`, hand back to the gate: the user approves the document and its `Status` becomes `approved`.
