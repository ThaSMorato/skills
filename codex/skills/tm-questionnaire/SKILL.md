---
name: tm-questionnaire
description: "Write the questions the owner cannot answer alone into a questionnaire for the person who can, or fold a filled questionnaire's answers back into the documents waiting on them."
---

> **Codex.** Paths that start with `references/` are inside this skill's folder (the folder of this `SKILL.md`);
> in a shell command, write them as absolute paths. A stage named `$thasmorato-skills:tm-<name>` is another entry
> of this plugin: tell the owner to run it, never run it yourself.
>
> A command or an agent that takes time is waited on **once**: give `exec_command` or `write_stdin` a `yield_time_ms`
> long enough for it to finish (minutes for a test suite, never one second), and call `wait_agent` once for an agent.
> Every poll re-sends this whole conversation and learns nothing. Send a progress `send_message` when a step
> finishes, not while it runs.

**Argument** (the text after the skill name): <who it goes to and about what>, or <path to a filled questionnaire>


Read `references/skills/questionnaire/index.md` and follow it for: the text after the skill name

> Read the `asking` skill (`references/skills/asking/index.md`) before you report or ask.

Preflight: an argument that is a path to a `kind: questionnaire` file with answers runs **read-back**; anything else runs **write**. For write, there is at least one decision to send: an open question, a `> Needs Input:` marker, or one the owner names.

Postflight:
- **Write:** the file's path, the recipient, how many questions, and which documents are waiting on them. Sending it is the owner's step.
- **Read-back:** each answer and the `Decided` marker it became, the documents whose text has to change through their own stage, and what is still open.
