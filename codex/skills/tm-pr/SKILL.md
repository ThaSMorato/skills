---
name: tm-pr
description: "Write a ticket's pull request body from what the work left on disk: a summary drawn as the smallest view, before-and-after evidence, and the merge danger (one-way or two-way door, blast radius)."
---

> **Codex.** Paths that start with `references/` are inside this skill's folder (the folder of this `SKILL.md`);
> in a shell command, write them as absolute paths. A stage named `$thasmorato-skills:tm-<name>` is another entry
> of this plugin: tell the owner to run it, never run it yourself.

**Argument** (the text after the skill name): <ticket slug> <fixed point, the one $thasmorato-skills:tm-review used>


Read the `pr` skill (`references/skills/pr/SKILL.md`) for: the text after the skill name

> Read the `asking` skill (`references/skills/asking/SKILL.md`) before you report or ask: resolve every id to what it means, offer a structured choice where the answer is a closed set, and ask only what is genuinely a decision.

Preflight: the ticket's `progress.md` has `status: completed`, and a review file exists for it. A PR body written before the review cannot say what the review found; point at `$thasmorato-skills:tm-review` and stop. If `$thasmorato-skills:tm-tidy` has not run, say so and go on: it is optional.

Postflight: the path to `pr.md`, the door and the blast radius in one line, and anything listed as not verified. Then ask whether to open the pull request; open it only on a yes.
