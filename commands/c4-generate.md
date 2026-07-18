---
description: Generate C4 diagrams (PlantUML) — C1/C2 from the HLD, C3/C4 from the FDD.
argument-hint: (optional) feature name for C3/C4, and/or output folder
---

Use the `c4-generator` agent to generate C4 PlantUML diagrams into `docs/c4/` from `docs/hld.md` (C1/C2) and, for the feature $ARGUMENTS, `docs/fdd/<feature>.md` (C3/C4).

If neither the HLD nor an FDD exists, tell the user to run `/hld` or `/fdd` first.

After the agent returns, show which C4 levels were generated and which were skipped (with the reason), and the output paths.
