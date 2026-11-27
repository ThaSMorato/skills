---
name: tm-prototype
description: "Answer one design question with throwaway code (a clickable HTML demo of a state model, or switchable UI variants on the real page), record the answer where the design was waiting for it, and keep the code off the working branch."
---

> **Codex.** Paths that start with `references/` are inside this skill's folder (the folder of this `SKILL.md`);
> in a shell command, write them as absolute paths. A stage named `$thasmorato-skills:tm-<name>` is another entry
> of this plugin: tell the owner to run it, never run it yourself.
>
> A command or an agent that takes time is waited on **once**: give `exec_command` or `write_stdin` the longest
> `yield_time_ms` the command could need (a test suite takes minutes: ask for them, never for one second), and call
> `wait_agent` once for an agent. When a wait returns before the command ends, wait again with the same long value:
> a second long wait, never a run of short polls.
> Every poll re-sends this whole conversation and learns nothing. Send a progress `send_message` when a step
> finishes, not while it runs.

**Argument** (the text after the skill name): <the question, e.g. can an order be partly cancelled after a shipment left?>


Read `references/skills/prototype/index.md` and follow it for: the text after the skill name

> Read the `asking` skill (`references/skills/asking/index.md`) before you report or ask.

Preflight: there is one question, and it is a design question (logic or UI). "Build the feature" is not one: point at `$thasmorato-skills:tm-design`. More than one question is more than one prototype; ask which comes first.

Postflight: the question, how to open the prototype (the file or the URL and command), and once answered, the path to the prototype file, where the answer landed as a `Decided` marker, and what happened to the code (throwaway branch or deleted).
