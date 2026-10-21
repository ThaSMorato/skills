---
name: tm-handoff
description: "Write what only this conversation knows (decisions said in chat, preferences, what is in flight, what failed, the next step) into a handoff file for a fresh session, pointing at the flow's artifacts for everything else."
---

> **Codex.** Paths that start with `references/` are inside this skill's folder (the folder of this `SKILL.md`);
> in a shell command, write them as absolute paths. A stage named `$thasmorato-skills:tm-<name>` is another entry
> of this plugin: tell the owner to run it, never run it yourself.

**Argument** (the text after the skill name): [what the next session will do]


Read the `handoff` skill (`references/skills/handoff/SKILL.md`) for: the text after the skill name

> Read the `asking` skill (`references/skills/asking/SKILL.md`) before you report or ask: resolve every id to what it means, offer a structured choice where the answer is a closed set, and ask only what is genuinely a decision.

Postflight: the handoff's path, the line to start the next session with, and any decision you offered to move into its artifact.
