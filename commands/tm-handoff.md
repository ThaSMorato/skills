---
description: Write what only this conversation knows (decisions said in chat, preferences, what is in flight, what failed, the next step) into a handoff file for a fresh session, pointing at the flow's artifacts for everything else.
argument-hint: "[what the next session will do]"
disable-model-invocation: true
---

Read `${CLAUDE_PLUGIN_ROOT}/skills/handoff/SKILL.md` and follow it for: $ARGUMENTS

> Call the Skill tool with `thasmorato-skills:asking` before you report or ask: resolve every id to what it means, offer a structured choice where the answer is a closed set, and ask only what is genuinely a decision.

Postflight: the handoff's path, the line to start the next session with, and any decision you offered to move into its artifact.
