---
description: Analyze an existing codebase (brownfield) — whole-system architecture, or one component if named.
argument-hint: (optional) component name to deep-analyze; omit for whole-system architecture
---

If a component was named ($ARGUMENTS), use the `component-analyzer` agent to deep-analyze it into `docs/analysis/components/<component>.md`.

Otherwise, use the `architectural-analyzer` agent to analyze the whole system into `docs/analysis/architecture.md`.

Both are analysis-only — they never modify the codebase. After the agent returns, show a short summary and note that the analysis feeds `/hld`, `/fdd`, `/design`, and `/adr-identify --brownfield`.
