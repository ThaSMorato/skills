<!--
TEMPLATE: features-index (docs/features/README.md: the features the system has, living)
Filled by the decomposer agent, amended by every effort that adds, changes or retires a feature. It is
the state of the system, not of an effort: which features exist, what each covers, where its living
documents are. How one effort cuts and orders its work (epics, risk, parallelism) is the effort's
decomposition, `.scratch/<effort>/decomposition.md`, and dies with the effort.
PRUNE + RENUMBER optional sections that don't apply; (required) sections always stay.

IDS ARE PERMANENT ADDRESSES. On a re-run, never renumber: other artifacts are keyed on these ids and
slugs (docs/features/<slug>/, .scratch/<slug>/issues/). Insert with a suffix (F3a); a retired id is
never reused. A removed or merged row is struck through in "Retired", not deleted.
ASSUMPTIONS: a decision the sources do not give is marked `> Assumed:` (or `> Needs Input:` when no
value is defensible), per the `asking` skill (§4 the markers, §6 which values count and the ceiling).
An unmarked one is a validation finding (AS-N).
-->

# Features: <product>

## Metadata (required)
- **Status:** draft | in review | approved
- **Sources:** <docs/product/prd.md, docs/architecture/hld.md, docs/architecture/components.md, docs/adr/*.md>

## Features (required)
> One row per feature the system has or is being built to have. Every feature traces to at least one
> PRD requirement: that trace is what makes the 1:N coverage check computable.
>
> **`Not delivering`** is the boundary between this feature and its neighbours: what a reader might
> reasonably assume is inside and isn't. It is a scope decision, knowable now, and it is what stops
> `$thasmorato-skills:tm-fdd` inferring the bound and inferring it differently each run.
>
> **`Constrained by`** lists the ADRs binding this feature. Where the formal ADRs don't exist yet,
> cite the **ADR candidates the HLD flagged**. Leave it empty rather than inventing an id.
>
> **`State`** is `planned` until an effort delivers it, then `live`. The folder holds the feature's
> living documents: `README.md` (the feature's front page), `fdd.md`, `prd.md` when the feature earns
> one, `diagrams/` and `ui/`. The feature's `README.md` repeats `State`; the two agree.

| Feature | Covers (RF/RNF) | Components touched | Not delivering | Constrained by | Docs | State |
|---|---|---|---|---|---|---|
| **F1**: <name> (`<slug>`) | RF-001, RF-003 | <from components.md> | <the neighbouring scope it excludes> | <ADR ids, or none> | `docs/features/<slug>/` | planned \| live |

## Retired (optional)
> Features removed, merged, or split: **struck through, never deleted**, each with the reason and
> where its scope went. Without it, the next reader cannot tell a deliberate removal from an
> oversight, and a re-run looks like a first run.

| ~~Id~~ | Was | What happened |
|---|---|---|
| ~~F7~~ | <name> | merged into F3, the two shared a single seam |
