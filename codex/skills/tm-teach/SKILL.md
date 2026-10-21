---
name: tm-teach
description: "Teach a topic over several sessions in a teaching workspace (mission, trusted sources, learning records, glossary), through short HTML lessons with practice, each pitched just past what you already know."
---

> **Codex.** Paths that start with `references/` are inside this skill's folder (the folder of this `SKILL.md`);
> in a shell command, write them as absolute paths. A stage named `$thasmorato-skills:tm-<name>` is another entry
> of this plugin: tell the owner to run it, never run it yourself.

> **Codex setup.** This stage spawns plugin subagents. Before anything else, read
> `~/.codex/thasmorato-skills.json` (or `$CODEX_HOME/thasmorato-skills.json`). If it is missing or its `version`
> is not `0.6.7`, stop and tell the owner to run `$thasmorato-skills:tm-setup`, then this stage again.
> Plugin subagents carry the `tm-` prefix: their `agent_type` is `tm-` followed by the agent's name.

**Argument** (the text after the skill name): <what you want to learn>


Read the `teach` skill (`references/skills/teach/SKILL.md`) for: the text after the skill name

> Read the `asking` skill (`references/skills/asking/SKILL.md`) before you report or ask: resolve every id to what it means, offer a structured choice where the answer is a closed set, and ask only what is genuinely a decision.

Preflight: the current directory is the teaching workspace. If it is a code repository or holds unrelated files, say so and suggest a dedicated directory before writing anything; a workspace holds one mission. On a returning session, read `MISSION.md`, the learning records and `NOTES.md` before saying anything.

Postflight: the lesson's path (opened), what it teaches and why now, the learning records written this session with their evidence, and what the next lesson is likely to be.
