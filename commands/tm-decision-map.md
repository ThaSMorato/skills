---
description: Start or move an effort's decision map, one decision per session, for an effort too big for one session whose path is not clear yet.
argument-hint: "<effort slug>"
disable-model-invocation: true
---

Read `${CLAUDE_PLUGIN_ROOT}/skills/decision-map/SKILL.md` and follow it for: $ARGUMENTS

> Call the Skill tool with `thasmorato-skills:asking` before you report or ask: resolve every id to what it means, offer a structured choice where the answer is a closed set, and ask only what is genuinely a decision.

Preflight: the argument names the effort, the folder under `.scratch/`. With none, list the efforts that have a `decision-map.md` and ask which one, or the slug of a new one. A `decision-map.md` that exists runs **resume**; none runs **create**. A map with `status: closed` is not reopened: say so, and point at its next step.

Postflight: the map's path, the destination, what this session recorded, the frontier, and the next step as the command for the owner to run. Stop there: the stage that resolves the decision is the owner's to start.
