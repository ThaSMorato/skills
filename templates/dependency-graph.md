<!--
TEMPLATE: dependency-graph (the measured import graph between components)
Written by whoever measures the graph — /analyze the first time, /reconcile after that — always by the
method in the architecture skill's import-graph.md, so two measurements are comparable.
FACTS ONLY. What the edges SHOULD be is docs/boundaries.md; this file says what they ARE, at one commit.
Overwritten on every measurement: the previous state lives in git history and in the reconcile report.
The written file STARTS with the frontmatter below; this comment is not copied.
-->

---
kind: dependency-graph
measured_at: <YYYY-MM-DD>
measured_commit: <git rev-parse HEAD>
components_source: <docs/components.md, or `provisional — top-level directories`>
---

# Dependency graph

## Method (required)
> Per language: `native` (the tool, named), `recipe`, or `approximate` (Ruby constant references, and
> any recipe that could not resolve aliases). Approximate edges are reported, flagged.

| Language | Method | Tool or note |
|---|---|---|

## Edges (required)
> Component → component, with the number of file-level references behind each edge.

```yaml
edges:
  - {from: <component id>, to: <component id>, refs: <n>, method: native | recipe | approximate}
unassigned_files: <n>
```

## Cycles (required)
> Every cycle, as its full path, with the references that close it. `none` if there are none.

## Metrics (required)
| Component | Ca | Ce | I | A | D |
|---|---|---|---|---|---|
