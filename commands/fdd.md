---
description: Write a Feature Design Doc for one feature, from the HLD (docs/hld.md).
argument-hint: <feature name or slug>
---

Use the `fdd-writer` agent to synthesize a Feature Design Doc into `docs/fdd/<feature-slug>.md` for the feature: $ARGUMENTS

If no feature was given, ask which feature to spec. If `docs/hld.md` doesn't exist, tell the user to run `/hld` first instead of delegating.

After the agent returns, show a short summary: the public contracts, the chosen test seams, the acceptance criteria, and any `> Needs Input` markers. Don't edit the FDD yourself — if changes are needed, re-run the agent.
