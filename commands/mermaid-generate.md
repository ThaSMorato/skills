---
description: Generate Mermaid diagrams from an FDD into a single Markdown file.
argument-hint: <feature name or slug>
---

Use the `mermaid-generator` agent to generate Mermaid diagrams into `docs/diagrams/<feature>.md` from `docs/fdd/<feature>.md` for the feature: $ARGUMENTS

If the FDD doesn't exist, tell the user to run `/fdd` first.

After the agent returns, show the set of diagram views produced (by type) and the output path.
