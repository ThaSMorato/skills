---
description: Generate Mermaid diagrams from an FDD into a single Markdown file.
argument-hint: "<feature name or slug>"
disable-model-invocation: true
---

Call the Agent tool with `mermaid-generator` to generate Mermaid diagrams into `docs/features/<feature>/diagrams/flows.md` from `docs/features/<feature>/fdd.md` for the feature: $ARGUMENTS

If the FDD doesn't exist, tell the user to run `/tm-fdd` first.

After the agent returns, show the set of diagram views produced (by type) and the output path.
