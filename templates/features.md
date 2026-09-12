<!--
TEMPLATE: features (the decomposition — product → epics → features)
Filled by the decomposer agent after the component map and BEFORE the FDDs. It answers the question no
stage used to own: WHICH features exist. Without this list, "does every in-scope feature have an FDD?"
has no denominator, and feature size drifts because "feature" is whatever gets named in the moment.
PRUNE + RENUMBER optional sections that don't apply; (required) sections always stay.

IDS ARE PERMANENT ADDRESSES. On a re-run, never renumber: other artifacts are keyed on these ids and
slugs (docs/fdd/<slug>.md, .scratch/<slug>/issues/). Insert with a suffix (E1b, F3a); a retired id is
never reused. A removed or merged row is struck through in "Retired", not deleted.
-->

# Decomposition — <product>

## Metadata (required)
- **Status:** draft | in review | approved
- **Sources:** <prd.md, hld.md, components.md, adr/*.md>

## Epics (required)
> A module-level slice of the product — `Level: module (EPIC)` in the PRD's vocabulary. Epics answer
> two different scheduling questions, and the columns keep them apart:
> **`Parallel-safe with`** says what may run *at the same time* — derived from component overlap.
> **`Depends on`** and **`Exists to falsify`** say what should run *first*.
>
> Ordering by risk matters more than ordering by value: the cheapest moment to be wrong about a
> structural decision is before anything is built on it. An epic whose purpose is to **falsify** a
> decision — to prove the spine holds, or find out early that it doesn't — earns its place at the
> front and is usually deliberately thin. Name the decision it tests, by ADR id or by the HLD section
> that records it.
>
> **`Adopted by`** is a *soft* edge: the epic should land before the ones that adopt it, but must
> never block them. A shared UI foundation is the classic case — without the soft edge it becomes
> either a hard dependency that stalls work, or nothing at all, in which case the same decision gets
> made independently in six places.

| Epic | Delivers | Components touched | Depends on | Parallel-safe with | Adopted by (soft) | Exists to falsify |
|---|---|---|---|---|---|---|
| **E1** — <name> | <the outcome, one line> | <from components.md> | <epic ids, or none> | <epic ids> | <epic ids, or none> | <ADR id / HLD section, or none> |

## Features (required)
> The unit an FDD specs and `/tickets` breaks down. Every feature belongs to exactly one epic and
> traces to at least one PRD requirement — that trace is what makes the 1:N coverage check computable.
> Keep features comparable in size within an epic.
>
> **`Depends on`** records cross-feature blocking — F4 cannot start until F2's schema lands. These
> edges are **coarse and advisory**: `/tickets` owns the authoritative blocking graph at ticket
> level. What they exist for is the product-wide view, which ticket edges cannot give because
> `/tickets` reads one FDD at a time and can never see across features.
>
> **`Not delivering`** is the boundary between this feature and its neighbours — what a reader might
> reasonably assume is inside and isn't. It is a scope decision, knowable now, and it is what stops
> `/fdd` inferring the bound and inferring it differently each run.
>
> **`Constrained by`** lists the ADRs binding this feature. Where the formal ADRs don't exist yet,
> cite the **ADR candidates the HLD flagged**. Leave it empty rather than inventing an id.

| Feature | Epic | Covers (RF/RNF) | Depends on | Components touched | Not delivering | Constrained by | FDD |
|---|---|---|---|---|---|---|---|
| **F1** — <slug> | E1 | RF-001, RF-003 | <feature ids, or none> | | <the neighbouring scope it excludes> | <ADR ids, or none> | `docs/fdd/<slug>.md` |

## Requirement coverage (required)
> The omission direction: every RF/RNF in the PRD scope is owned by at least one feature. List here
> anything **not fully** covered, with the reason — deferred, out of scope, genuinely missed, or
> **partial**.
>
> **Partial coverage is not coverage.** A requirement naming two things, of which a feature delivers
> one, belongs here marked `partial` — not ticked in the table above. Half a proof credited as a
> proof is how a requirement gets marked done by a release that does not meet it.

| Requirement | Covered by | Status (covered \| partial \| uncovered) | If not fully covered, why |
|---|---|---|---|

## Divergence: journey vs component (optional)
> Where the user-journey carve-up and the component carve-up disagree. The journey wins the feature
> boundary — a feature must deliver user-visible value — and the disagreement is recorded here because
> it predicts where features will contend for the same component.

## Retired (optional)
> Features and epics removed, merged, or split on a re-run — **struck through, never deleted**, each
> with the reason and where its scope went. The previous cut is part of the record: without it, the
> next reader cannot tell a deliberate removal from an oversight, and a re-run looks like a first run.

| ~~Id~~ | Was | What happened |
|---|---|---|
| ~~F7~~ | <name> | merged into F3 — the two shared a single seam |

## Open questions / Needs Input (optional)
