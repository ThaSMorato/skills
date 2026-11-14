---
description: After /tm-implement and before /tm-review, make a ticket's change smaller without changing behavior (revert incidental hunks, reuse what the repo already has, drop files and layers the change did not need, pull a spread-out behavior into fewer files). Proposed with evidence, applied only where you choose, tests untouched.
argument-hint: "<ticket slug> <fixed point, the one /tm-review will use>"
disable-model-invocation: true
---

Read `${CLAUDE_PLUGIN_ROOT}/skills/trim/SKILL.md` and follow it for: $ARGUMENTS

> Call the Skill tool with `thasmorato-skills:asking` before you report or ask: resolve every id to what it means, offer a structured choice where the answer is a closed set, and ask only what is genuinely a decision.

Preflight: the ticket's `progress.md` has `status: completed`. Trimming a half-built ticket cuts code the next SI may need. If it is not completed, point at `/tm-implement` and stop. Then confirm the fixed point resolves and the diff is non-empty.

Show the diff's size, then the proposals grouped by criterion, in criterion order, each with its evidence. Ask which to apply. Then apply them one at a time, reporting per cut: applied, or reverted and why.

Postflight: the diff's size before and after, the unrequested-behavior notes, and the next step, `/tm-review <fixed point>`.
