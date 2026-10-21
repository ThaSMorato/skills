---
name: tm-trim
description: "After $thasmorato-skills:tm-implement and before $thasmorato-skills:tm-review, make a ticket's change smaller without changing behavior (revert incidental hunks, reuse what the repo already has, drop files and layers the change did not need, pull a spread-out behavior into fewer files). Proposed with evidence, applied only where you choose, tests untouched."
---

> **Codex.** Paths that start with `references/` are inside this skill's folder (the folder of this `SKILL.md`);
> in a shell command, write them as absolute paths. A stage named `$thasmorato-skills:tm-<name>` is another entry
> of this plugin: tell the owner to run it, never run it yourself.

**Argument** (the text after the skill name): <ticket slug> <fixed point, the one $thasmorato-skills:tm-review will use>


Read `references/skills/trim/index.md` and follow it for: the text after the skill name

> Read the `asking` skill (`references/skills/asking/index.md`) before you report or ask: resolve every id to what it means, offer a structured choice where the answer is a closed set, and ask only what is genuinely a decision.

Preflight: the ticket's `progress.md` has `status: completed`. Trimming a half-built ticket cuts code the next SI may need. If it is not completed, point at `$thasmorato-skills:tm-implement` and stop. Then confirm the fixed point resolves and the diff is non-empty.

Show the diff's size, then the proposals grouped by criterion, in criterion order, each with its evidence. Ask which to apply. Then apply them one at a time, reporting per cut: applied, or reverted and why.

Postflight: the diff's size before and after, the unrequested-behavior notes, and the next step, `$thasmorato-skills:tm-review <fixed point>`.
