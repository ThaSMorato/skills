---
name: tm-steering-validate
description: "Check that the instructions an agent follows in this repo agree with each other (CLAUDE.md and AGENTS.md at every level, path-scoped rules, stack and testing guides, the guidelines router) and give a clean/dirty verdict."
---

> **Codex.** Paths that start with `references/` are inside this skill's folder (the folder of this `SKILL.md`);
> in a shell command, write them as absolute paths. A stage named `$thasmorato-skills:tm-<name>` is another entry
> of this plugin: tell the owner to run it, never run it yourself.

**Argument** (the text after the skill name): (none): the whole repo


Read `references/skills/steering-validate/index.md` and follow it for: the text after the skill name

> Read the `asking` skill (`references/skills/asking/index.md`) before you report or ask: resolve every id to what it means, offer a structured choice where the answer is a closed set, and ask only what is genuinely a decision.

Preflight: Node is available (`node --version`): the inventory is a script. With no steering file at all, say so and stop: there is nothing to compare, and `$thasmorato-skills:tm-guidelines` writes the first ones.

Postflight: the path to `docs/validation/steering.md`, the verdict, the findings by category with both sides quoted, the `PL` divergences apart, and which stage owns each fix.
