---
name: tm-generate-stack-guide
description: "Generate a per-technology engineering guide skill (conventions, idioms, gotchas and security idioms for one language or framework), as a lazy-loaded router."
---

> **Codex.** Paths that start with `references/` are inside this skill's folder (the folder of this `SKILL.md`);
> in a shell command, write them as absolute paths. A stage named `$thasmorato-skills:tm-<name>` is another entry
> of this plugin: tell the owner to run it, never run it yourself.

> **Codex setup.** This stage spawns plugin subagents. Before anything else, read
> `~/.codex/thasmorato-skills.json` (or `$CODEX_HOME/thasmorato-skills.json`). If it is missing or its `version`
> is not `0.7.0`, stop and tell the owner to run `$thasmorato-skills:tm-setup`, then this stage again.
> Plugin subagents carry the `tm-` prefix: their `agent_type` is `tm-` followed by the agent's name.

**Argument** (the text after the skill name): <technology> (e.g. ruby, react, nestjs, go)


Read `references/skills/generate-stack-guide/index.md` and follow it for: the text after the skill name

Run all five phases: choose the source, mine it, confirm the calls with the user, generate `.claude/skills/<tech>-guide/`, and register the routing row in `docs/guidelines.md`.

The unit is the **technology**, not the project: a Ruby + React repo gets two guides that compose, and each one is reusable in the next repo that uses that stack.

After it returns, show what was generated, which conventions came from the repo versus the external source, and any place the two disagreed.
