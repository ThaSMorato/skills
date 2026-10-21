---
name: tm-doc-validate
description: "Validate a design document against the one it came from before the human gate (coverage both ways, contradictions, glossary drift, unanswered RNFs) with a clean/dirty verdict."
---

> **Codex.** Paths that start with `references/` are inside this skill's folder (the folder of this `SKILL.md`);
> in a shell command, write them as absolute paths. A stage named `$thasmorato-skills:tm-<name>` is another entry
> of this plugin: tell the owner to run it, never run it yourself.

**Argument** (the text after the skill name): <from> <to> (e.g. "prd hld"), or omit to validate every available pair


Read the `doc-validate` skill (`references/skills/doc-validate/index.md`) to check: the text after the skill name

> Read the `asking` skill (`references/skills/asking/index.md`) before you report or ask: resolve every id to what it means, offer a structured choice where the answer is a closed set, and ask only what is genuinely a decision.

With no argument, validate every pair whose two documents exist: `brief → prd`, `prd → hld`, `prd → features`, `hld → components`, `features → fdd`.

Before delegating, confirm both sides of each pair exist: a missing target should fail here, with the name of the command that produces it, not inside the check.

After it returns, show for each pair: the verdict, the open issues most-severe first, and (first, because it is the one nothing else looks for) anything in the **coverage** category, where the source said something and the target dropped it.

If any pair is `dirty`, the fix goes back to the stage that wrote the document: re-run its command, or edit the file directly. Then re-run this. If everything is `clean`, hand back to the gate: the user approves the document and its `Status` becomes `approved`.
