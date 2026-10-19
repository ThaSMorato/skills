---
name: tm-teach
description: Teach a topic over several sessions in a teaching workspace (mission, trusted sources, learning records, glossary), through short HTML lessons with practice, each pitched just past what you already know.
argument-hint: "<what you want to learn>"
user-invocable: false
---

Load skill `thasmorato-skills:teach` for: the owner's supplied arguments

> Load skill `thasmorato-skills:asking` before you report or ask: resolve every id to what it means, offer a structured choice where the answer is a closed set, and ask only what is genuinely a decision.

Preflight: the current directory is the teaching workspace. If it is a code repository or holds unrelated files, say so and suggest a dedicated directory before writing anything; a workspace holds one mission. On a returning session, read `MISSION.md`, the learning records and `NOTES.md` before saying anything.

Postflight: the lesson's path (opened), what it teaches and why now, the learning records written this session with their evidence, and what the next lesson is likely to be.

## Stage boundary
Deliver this stage's artifact, name the next command as a recommendation to the owner, and stop the turn. Never invoke another stage, repeat this stage, or ask another agent/harness to perform the next stage. A dirty verdict is a report, never an automatic fix/revalidate loop. Only `/tm-flow` may coordinate transitions, each after an explicit owner gate. A subagent does its assigned work itself and never delegates again.

## Codex adapter (generated)
Load core skills by opening their SKILL.md from this plugin, stripping `thasmorato-skills:` from the logical name. For delegation use the available spawn tool with the named agent's instructions from `../../agent-specs/<name>.md`; if the client has registered the generated TOML agents, use those. Parallelize independent read-only lenses within the host concurrency limit, queueing remaining lenses. A subagent never delegates again. If delegation is unavailable, disclose that and execute each requested lens serially, preserving separate evidence. Never silently drop a lens. Use numbered choices if the host has no wizard.
