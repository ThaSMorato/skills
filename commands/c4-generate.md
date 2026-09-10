---
description: Generate C4 diagrams (PlantUML) — C1/C2 from the HLD, the system C3 from the component map, C3/C4 per feature from the FDD.
argument-hint: (optional) feature name for the feature-level diagrams; omit for the system levels
---

Use the `c4-generator` agent to generate C4 PlantUML diagrams into `docs/c4/`:

- **System levels** from `docs/hld.md` (C1, C2) and `docs/components.md` (C3).
- **Feature levels** for $ARGUMENTS from `docs/fdd/<feature>.md` (C3, and C4 where code-level detail exists).

If neither the HLD nor an FDD exists, tell the user to run `/hld` or `/fdd` first. If the HLD exists but `docs/components.md` does not, note that the system C3 will be skipped and that `/components` produces its source.

After the agent returns, show which C4 levels were generated and which were skipped (with the reason), and the output paths.
