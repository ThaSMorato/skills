---
name: tm-acceptance
description: "Check every acceptance criterion and every part of the owner's request in the running software (browser and screenshot, a named test, or not verified with the reason) after the last change, and record it for $thasmorato-skills:tm-pr."
---

> **Codex.** Paths that start with `references/` are inside this skill's folder (the folder of this `SKILL.md`);
> in a shell command, write them as absolute paths. A stage named `$thasmorato-skills:tm-<name>` is another entry
> of this plugin: tell the owner to run it, never run it yourself.

**Argument** (the text after the skill name): <ticket slug>


Read the `acceptance` skill (`references/skills/acceptance/SKILL.md`) for: the text after the skill name

> Read the `asking` skill (`references/skills/asking/SKILL.md`) before you report or ask: resolve every id to what it means, offer a structured choice where the answer is a closed set, and ask only what is genuinely a decision.

Preflight: the ticket's `progress.md` has `status: completed` and a review file exists for it. Run this after the review fixes and `$thasmorato-skills:tm-tidy`, because a later change to production code makes the record stale.

Postflight: the path to the acceptance file, the counts by verdict, every failure and every item not verified (each quoted), and the next step, `$thasmorato-skills:tm-walkthrough` or `$thasmorato-skills:tm-pr`.
