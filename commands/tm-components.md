---
description: Build the system component map from the HLD, the named parts every FDD maps its feature onto (the system-level C3).
argument-hint: "(none): runs once per system; re-run when the HLD changes or /tm-reconcile reports drift"
disable-model-invocation: true
---

Call the Agent tool with `component-mapper` to write `docs/architecture/components.md` from `docs/architecture/hld.md`.

> Call the Skill tool with `thasmorato-skills:asking` before you report or ask: resolve every id to what it means, offer a structured choice where the answer is a closed set, and ask only what is genuinely a decision.

This is the step that closes a real gap in the chain: the HLD is **required** to list components, and until now nothing turned that list into a shared map, so each FDD invented its own carve-up and nobody owned the cross-feature picture.

If `docs/architecture/hld.md` doesn't exist, tell the user to run `/tm-hld` first instead of delegating.

After the agent returns, show: the component inventory, which are policy and which are detail, any gaps or overlaps the owns/does-not-own pass surfaced, and, in brownfield, the metrics table, any dependency cycles, and where the code's structure diverges from the HLD's. On a re-run, show what was amended and what moved to `Retired`, with the reconcile item behind each.

**Decisions the amendment changed** (the agent returns them, one line each): show every one, then name `/tm-adr-identify`, which records each as an ADR that amends or supersedes the old decision. A changed decision with no ADR is a regression `/tm-doc-validate` reports.

**GATE (strong).** The user approves the map before any FDD is written: every feature spec below depends on these names, and renaming a component afterwards means touching every FDD that used it. On approval, set `Status: approved` in the file.

Then suggest `/tm-c4-generate` for the system C3 diagram, and `/tm-decompose` to cut the product into epics and features along these boundaries.
