---
description: Sweep the design docs (HLD/FDD) for architectural decisions that merit an ADR, proposing Potential ADRs.
argument-hint: (optional) modules/paths to focus on, or --brownfield to analyze the codebase
---

Use the `adr-analyzer` agent to sweep the design docs for ADR-worthy decisions and write Potential ADRs under `docs/adr/potential/`. Focus: $ARGUMENTS

If neither `docs/hld.md` nor `docs/fdd/*.md` exists (and this isn't a `--brownfield` run), tell the user to run `/hld` or `/fdd` first.

After the agent returns, show a short summary: the Potential ADRs found (with their Step-0 category or 3-E justification) and any `> Needs Input`. The user confirms which to formalize with `/adr-generate`.
