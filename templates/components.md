<!--
TEMPLATE: components (the system component map — C3 at system scale)
Filled by the component-mapper agent from the HLD's "Main components and responsibilities", after the
HLD and BEFORE the FDDs. This is the VOCABULARY the FDDs map features onto — without it, every FDD
invents its own carve-up and nobody owns the cross-feature picture.
It is a MAP (what parts exist), not a CONTRACT (who may depend on whom) — the contract is
docs/boundaries.md, written after the FDDs. PRUNE + RENUMBER optional sections; (required) stay.
-->

# Component map — <system>

## Metadata (required)
- **Status:** draft | in review | approved
- **Level:** system
- **Sources:** <hld.md, analysis/architecture.md, prd.md>

## Component inventory (required)
> One row per component. A **component** is an independently releasable unit of the system's structure
> — one level below the HLD's containers. `Kind` says whether it holds business policy or plumbing;
> the boundary contract later depends on that distinction.

| Component | Responsibility | Kind (policy \| detail) | Lives in (path/module) | Container |
|---|---|---|---|---|
| <name> | <what it is responsible for, one line> | policy | <path or `new`> | <container from the HLD> |

## Responsibilities in depth (required)
> Per component: what it owns, and — the overloaded second axis — what it explicitly does **not** own.
> The negative half is where the carve-up errors surface.

### <component>
- **Owns:**
- **Does not own:**

## Observed dependencies (optional — brownfield)
> The edges that exist in the code today, from the import graph in `docs/analysis/architecture.md`.
> Facts, not intent. The desired edges are decided later, in `docs/boundaries.md`.

| From | To | Evidence |
|---|---|---|

## Structural metrics (optional — brownfield)
> Per component, from the import graph: `Ca` (incoming), `Ce` (outgoing), `I = Ce/(Ca+Ce)`,
> `A = abstract types / total types`, `D = |A + I − 1|`. High `D` means far from the Main Sequence:
> `A` and `I` both low is the Zone of Pain, both high is the Zone of Uselessness.

| Component | Ca | Ce | I | A | D | Reading |
|---|---|---|---|---|---|---|

## Dependency cycles (optional — brownfield)
> Cycles found in the component graph, each as its full path. A cycle violates the Acyclic Dependencies
> Principle: the components in it can no longer be released independently.

## Open questions / Needs Input (optional)
> Carve-ups the map could not settle — components that may need to split, merge, or be renamed once
> the FDDs reveal the real axes of change.
