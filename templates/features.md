<!--
TEMPLATE: features (the decomposition — product → epics → features)
Filled by the decomposer agent after the component map and BEFORE the FDDs. It answers the question no
stage used to own: WHICH features exist. Without this list, "does every in-scope feature have an FDD?"
has no denominator, and feature size drifts because "feature" is whatever gets named in the moment.
PRUNE + RENUMBER optional sections that don't apply; (required) sections always stay.
-->

# Decomposition — <product>

## Metadata (required)
- **Status:** draft | in review | approved
- **Sources:** <prd.md, hld.md, components.md>

## Epics (required)
> A module-level slice of the product — `Level: module (EPIC)` in the PRD's vocabulary. An epic is the
> unit of **parallel work**: two epics may run in separate worktrees only when their components do not
> overlap. Keep epics comparable in size to each other.

| Epic | Delivers | Components touched | Depends on | Parallel-safe with |
|---|---|---|---|---|
| **E1** — <name> | <the outcome, one line> | <from components.md> | <epic ids, or none> | <epic ids> |

## Features (required)
> The unit an FDD specs and `/tickets` breaks down. Every feature belongs to exactly one epic and
> traces to at least one PRD requirement — that trace is what makes the 1:N coverage check computable.
> Keep features comparable in size within an epic.

| Feature | Epic | Covers (RF/RNF) | Components touched | FDD |
|---|---|---|---|---|
| **F1** — <slug> | E1 | RF-001, RF-003 | | `docs/fdd/<slug>.md` |

## Requirement coverage (required)
> The omission direction: every RF/RNF in the PRD scope appears against at least one feature. List
> here anything **not** covered, with the reason — deferred, out of scope, or genuinely missed.

| Requirement | Covered by | If uncovered, why |
|---|---|---|

## Divergence: journey vs component (optional)
> Where the user-journey carve-up and the component carve-up disagree. The journey wins the feature
> boundary — a feature must deliver user-visible value — and the disagreement is recorded here because
> it predicts where features will contend for the same component.

## Open questions / Needs Input (optional)
