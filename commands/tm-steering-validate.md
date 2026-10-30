---
description: Check that the instructions an agent follows in this repo agree with each other (CLAUDE.md and AGENTS.md at every level, path-scoped rules, stack and testing guides, the guidelines router) and give a clean/dirty verdict.
argument-hint: "(none): the whole repo"
disable-model-invocation: true
---

Read `${CLAUDE_PLUGIN_ROOT}/skills/steering-validate/SKILL.md` and follow it for: $ARGUMENTS

> Call the Skill tool with `thasmorato-skills:asking` before you report or ask: resolve every id to what it means, offer a structured choice where the answer is a closed set, and ask only what is genuinely a decision.

Preflight: Node is available (`node --version`): the inventory is a script. With no steering file at all, say so and stop: there is nothing to compare, and `/tm-guidelines` writes the first ones.

Postflight: the path to `docs/validation/steering.md`, the verdict, the findings by category with both sides quoted, the `PL` divergences apart, and which stage owns each fix.
