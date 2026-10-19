---
description: Build the system component map from the HLD, the named parts every FDD maps its feature onto (the system-level C3).
argument-hint: "(none): runs once per system; re-run when the HLD changes or /tm-reconcile reports drift"
---

Delegate to subagent `component-mapper` to write `docs/arquitetura/components.md` from `docs/arquitetura/hld.md`.

> Load skill `thasmorato-skills:asking` before you report or ask: resolve every id to what it means, offer a structured choice where the answer is a closed set, and ask only what is genuinely a decision.

This is the step that closes a real gap in the chain: the HLD is **required** to list components, and until now nothing turned that list into a shared map, so each FDD invented its own carve-up and nobody owned the cross-feature picture.

If `docs/arquitetura/hld.md` doesn't exist, tell the user to run `/tm-hld` first instead of delegating.

After the agent returns, show: the component inventory, which are policy and which are detail, any gaps or overlaps the owns/does-not-own pass surfaced, and, in brownfield, the metrics table, any dependency cycles, and where the code's structure diverges from the HLD's. On a re-run, show what was amended and what moved to `Redirects`, with the reconcile item behind each.

**GATE (strong).** The user approves the map before any FDD is written: every feature spec below depends on these names, and renaming a component afterwards means touching every FDD that used it. On approval, set `Status: approved` in the file.

Then suggest `/tm-c4-generate` for the system C3 diagram, and `/tm-decompose` to cut the product into epics and features along these boundaries.

## Stage boundary
Deliver this stage's artifact, name the next command as a recommendation to the owner, and stop the turn. Never invoke another stage, repeat this stage, or ask another agent/harness to perform the next stage. A dirty verdict is a report, never an automatic fix/revalidate loop. Only `/tm-flow` may coordinate transitions, each after an explicit owner gate. A subagent does its assigned work itself and never delegates again.

## Harness adapter (generated)
In Claude Code, load a named plugin skill through the Skill tool with its fully qualified `thasmorato-skills:<name>`. Delegate a named subagent through the Agent tool. Never resolve a bare skill name from another plugin. Use AskUserQuestion when available, otherwise numbered options. Relative plugin paths in the source are relative to that source file, not the project cwd.
