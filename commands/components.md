---
description: Build the system component map from the HLD — the named parts every FDD maps its feature onto (the system-level C3).
argument-hint: "(none) — runs once per system, re-run when the HLD changes"
---

Use the `component-mapper` agent to write `docs/components.md` from `docs/hld.md`.

> Load the `asking` skill before you report or ask: resolve every id to what it means, offer a structured choice where the answer is a closed set, and ask only what is genuinely a decision.

This is the step that closes a real gap in the chain: the HLD is **required** to list components, and until now nothing turned that list into a shared map — so each FDD invented its own carve-up and nobody owned the cross-feature picture.

If `docs/hld.md` doesn't exist, tell the user to run `/hld` first instead of delegating.

After the agent returns, show: the component inventory, which are policy and which are detail, any gaps or overlaps the owns/does-not-own pass surfaced, and — in brownfield — the metrics table, any dependency cycles, and where the code's structure diverges from the HLD's.

**GATE (strong).** The user approves the map before any FDD is written: every feature spec below depends on these names, and renaming a component afterwards means touching every FDD that used it. On approval, set `Status: approved` in the file.

Then suggest `/c4-generate` for the system C3 diagram, and `/decompose` to cut the product into epics and features along these boundaries.
