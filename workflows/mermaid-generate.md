---
description: Generate Mermaid diagrams from an FDD into a single Markdown file.
argument-hint: "<feature name or slug>"
---

Delegate to subagent `mermaid-generator` to generate Mermaid diagrams into `docs/diagrams/<feature>.md` from `docs/features/<feature>/fdd.md` for the feature: $ARGUMENTS

If the FDD doesn't exist, tell the user to run `/tm-fdd` first.

After the agent returns, show the set of diagram views produced (by type) and the output path.

## Stage boundary
Deliver this stage's artifact, name the next command as a recommendation to the owner, and stop the turn. Never invoke another stage, repeat this stage, or ask another agent/harness to perform the next stage. A dirty verdict is a report, never an automatic fix/revalidate loop. Only `/tm-flow` may coordinate transitions, each after an explicit owner gate. A subagent does its assigned work itself and never delegates again.
