---
name: tm-pr
description: "Write a ticket's pull request body from what the work left on disk: a summary drawn as the smallest view, before-and-after evidence, and the merge danger (one-way or two-way door, blast radius)."
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
> is not `0.7.0`, stop and tell the owner to run `$thasmorato-skills:tm-setup`, then this stage again.
> Plugin subagents carry the `tm-` prefix: their `agent_type` is `tm-` followed by the agent's name.

**Argument** (the text after the skill name): <ticket slug> <fixed point, the one $thasmorato-skills:tm-review used>


Read `references/skills/pr/index.md` and follow it for: the text after the skill name

> Read the `asking` skill (`references/skills/asking/index.md`) before you report or ask.

Preflight: the ticket's `progress.md` has `status: completed`, and a review file exists for it. A PR body written before the review cannot say what the review found; point at `$thasmorato-skills:tm-review` and stop. If `$thasmorato-skills:tm-tidy` has not run, say so and go on: it is optional. Then the skill's own Preflight: blockers and branch, signing, host and tracker auth, the tracker id, acceptance after the last change, a change after the review, a visible change in the Direct gear, files the branch did not touch, the repo's obligations.

Postflight: the path to `prs/<NN>-<slug>.md`, the door and the blast radius in one line, anything listed as not verified, and the skill's Postflight (sibling placeholders, tracker fields, the remaining tickets and what each one waits on). Then ask whether to open the pull request, as a structured choice; open it only on a yes.
