---
description: Teach a topic over several sessions in a teaching workspace (mission, trusted sources, learning records, glossary), through short HTML lessons with practice, each pitched just past what you already know.
argument-hint: "<what you want to learn>"
---

Load skill `thasmorato-skills:teach` for: $ARGUMENTS

> Load skill `thasmorato-skills:asking` before you report or ask: resolve every id to what it means, offer a structured choice where the answer is a closed set, and ask only what is genuinely a decision.

Preflight: the current directory is the teaching workspace. If it is a code repository or holds unrelated files, say so and suggest a dedicated directory before writing anything; a workspace holds one mission. On a returning session, read `MISSION.md`, the learning records and `NOTES.md` before saying anything.

Postflight: the lesson's path (opened), what it teaches and why now, the learning records written this session with their evidence, and what the next lesson is likely to be.

## Stage boundary
Deliver this stage's artifact, name the next command as a recommendation to the owner, and stop the turn. Never invoke another stage, repeat this stage, or ask another agent/harness to perform the next stage. A dirty verdict is a report, never an automatic fix/revalidate loop. Only `/tm-flow` may coordinate transitions, each after an explicit owner gate. A subagent does its assigned work itself and never delegates again.

## Harness adapter (generated)
In Claude Code, load a named plugin skill through the Skill tool with its fully qualified `thasmorato-skills:<name>`. Delegate a named subagent through the Agent tool. Never resolve a bare skill name from another plugin. Use AskUserQuestion when available, otherwise numbered options. Relative plugin paths in the source are relative to that source file, not the project cwd.
