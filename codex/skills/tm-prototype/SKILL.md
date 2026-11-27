---
name: tm-prototype
description: "Answer one design question with throwaway code (a clickable HTML demo of a state model, or switchable UI variants on the real page), record the answer where the design was waiting for it, and keep the code off the working branch."
---

> **Codex.** Paths that start with `references/` are inside this skill's folder (the folder of this `SKILL.md`);
> in a shell command, write them as absolute paths. A stage named `$thasmorato-skills:tm-<name>` is another entry
> of this plugin: tell the owner to run it, never run it yourself.
>
> A command or an agent that takes time is waited on **once**: give `exec_command` or `write_stdin` a `yield_time_ms`
> long enough for it to finish (minutes for a test suite, never one second), and call `wait_agent` once for an agent.
> Every poll re-sends this whole conversation and learns nothing. Send a progress `send_message` when a step
> finishes, not while it runs.

**Argument** (the text after the skill name): <the question, e.g. can an order be partly cancelled after a shipment left?>


Read `references/skills/prototype/index.md` and follow it for: the text after the skill name

> Read the `asking` skill (`references/skills/asking/index.md`) before you report or ask.

Preflight: there is one question, and it is a design question (logic or UI). "Build the feature" is not one: point at `$thasmorato-skills:tm-design`. More than one question is more than one prototype; ask which comes first.

Postflight: the question, how to open the prototype (the file or the URL and command), and once answered, the path to the prototype file, where the answer landed as a `Decided` marker, and what happened to the code (throwaway branch or deleted).
