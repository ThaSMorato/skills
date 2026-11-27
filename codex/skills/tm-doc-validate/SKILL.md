---
name: tm-doc-validate
description: "Validate a design document against the one it came from before the human gate (coverage both ways, contradictions, glossary drift, unanswered RNFs) with a clean/dirty verdict."
---

> **Codex.** Paths that start with `references/` are inside this skill's folder (the folder of this `SKILL.md`);
> in a shell command, write them as absolute paths. A stage named `$thasmorato-skills:tm-<name>` is another entry
> of this plugin: tell the owner to run it, never run it yourself.
>
> A command or an agent that takes time is waited on **once**: give `exec_command` or `write_stdin` a `yield_time_ms`
> long enough for it to finish (minutes for a test suite, never one second), and call `wait_agent` once for an agent.
> Every poll re-sends this whole conversation and learns nothing. Send a progress `send_message` when a step
> finishes, not while it runs.

> **Codex setup.** This stage spawns plugin subagents. Before anything else, read
> `~/.codex/thasmorato-skills.json` (or `$CODEX_HOME/thasmorato-skills.json`). If it is missing or its `version`
> is not `0.7.1`, stop and tell the owner to run `$thasmorato-skills:tm-setup`, then this stage again.
> Plugin subagents carry the `tm-` prefix: their `agent_type` is `tm-` followed by the agent's name.

**Argument** (the text after the skill name): <from> <to> (e.g. "prd hld"), or omit to validate every available pair


Read `references/skills/doc-validate/index.md` and follow it to check: the text after the skill name

> Read the `asking` skill (`references/skills/asking/index.md`) before you report or ask.

With no argument, validate every pair whose two documents exist: `brief → prd`, `prd → hld`, `prd → features`, `hld → components`, `features → fdd`.

Before delegating, confirm both sides of each pair exist: a missing target should fail here, with the name of the command that produces it, not inside the check.

After it returns, show for each pair: the verdict, the open issues most-severe first, and (first, because it is the one nothing else looks for) anything in the **coverage** category, where the source said something and the target dropped it.

If any pair is `dirty`, the fix goes back to the stage that wrote the document: re-run its command, or edit the file directly. Then re-run this. If everything is `clean`, hand back to the gate: the user approves the document and its `Status` becomes `approved`.
