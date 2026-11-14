---
name: tm-setup
description: "Install this plugin's subagents into Codex (once per plugin version). Run it after installing or upgrading the plugin, or when a stage says the setup is missing."
---


Codex does not load subagents from a plugin, only from `~/.codex/agents/` (or `$CODEX_HOME/agents/`). This skill installs the plugin's agents there, all named `tm-<agent>`, and records the version the stages check before they spawn one.

1. Run `node "<this skill's folder>/scripts/install-agents.mjs"`, with the absolute path of the folder of this `SKILL.md`. It writes into the Codex home, outside the workspace, so the sandbox asks for approval: say so before running it.
2. It replaces only files this plugin wrote and removes the agents a newer version dropped. If it refuses because a `tm-*.toml`, or the `tm-review.config.toml` profile, was not written by this plugin, show the owner the paths and stop: never move or delete that file yourself.
3. Report what it printed: the version (`0.7.0`), how many agents it installed, any it removed, and the profile. Codex reads agents when a session starts, so tell the owner to open a new session before running a stage that spawns agents.
4. Explain the profile once. Codex ignores a subagent's `sandbox_mode`, so a review lens is read-only only when the whole session is. `tm-review.config.toml` makes it so for the session and every subagent, asks before each write, sets the review's effort and leaves the model the owner's. Tell the owner to start the validators (`tm-plan-validate`, `tm-tickets-validate`, `tm-doc-validate`) and `tm-review` with `codex -p tm-review`, and to approve only the write of the stage's report.

Stop here: this skill installs, it never runs a stage.
