---
description: Sweep the design docs (HLD/FDD/boundaries) for architectural decisions that merit an ADR, proposing Potential ADRs.
argument-hint: (optional) modules/paths to focus on, or --brownfield to analyze the codebase and git history
---

Use the `adr-analyzer` agent to sweep the design docs for ADR-worthy decisions and write Potential ADRs under `docs/adr/potential/`. Focus: $ARGUMENTS

If neither `docs/hld.md` nor `docs/fdd/*.md` exists (and this isn't a `--brownfield` run), tell the user to run `/hld` or `/fdd` first.

After the agent returns, show a short summary: the Potential ADRs found (with their Step-0 category or 3-E justification), which came from re-examining the brief's recorded decisions, and any `> Needs Input`.

Then ask the user which to formalize with `/adr-generate`. For the ones they reject, set `state: rejected` in the Potential's frontmatter with a one-line reason — a rejection that is not recorded gets re-proposed on the next sweep, and the sweep stops being trusted.
