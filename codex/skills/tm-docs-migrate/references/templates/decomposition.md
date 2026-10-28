<!--
TEMPLATE: decomposition (.scratch/<effort>/decomposition.md: how one effort cuts and orders its work)
Filled by the decomposer agent after the component map and BEFORE the FDDs. It answers, for this
effort, the question no stage used to own: WHICH features it builds, in WHICH order, and what may run
at the same time. Without it, "does every in-scope feature have an FDD?" has no denominator. It is
temporary: when the effort ships, the features it delivered are `live` in docs/features/README.md and
this file goes with the rest of `.scratch/<effort>/`.
PRUNE + RENUMBER optional sections that don't apply; (required) sections always stay.

Feature ids are the index's (docs/features/README.md): never invent one here. Epic ids are this
effort's; on a re-run, never renumber them either: insert with a suffix (E1b).
ASSUMPTIONS: a decision the sources do not give is marked `> Assumed:` (or `> Needs Input:` when no
value is defensible), per the `asking` skill (§4 the markers, §6 which values count and the ceiling).
An unmarked one is a validation finding (AS-N). Each marker is a callout: the line above it is
`> [!CAUTION]` for Needs Input, `> [!WARNING]` for Assumed, `> [!NOTE]` for Decided, and every line
of the marker starts with `> `.
-->

# Decomposition: <effort>

## Metadata (required)
- **Status:** draft | in review | approved
- **Effort:** <slug, the folder name under .scratch/>
- **Sources:** <.scratch/<effort>/brief.md, .scratch/<effort>/scope.md, docs/product/prd.md, docs/architecture/hld.md, docs/architecture/components.md, docs/adr/*.md, docs/features/README.md>

## Epics (required)
> A module-level slice of the effort, `Level: module (EPIC)` in the PRD's vocabulary. Epics answer
> two different scheduling questions, and the columns keep them apart:
> **`Parallel-safe with`** says what may run *at the same time*, derived from component overlap.
> **`Depends on`** and **`Exists to falsify`** say what should run *first*.
>
> Ordering by risk matters more than ordering by value: the cheapest moment to be wrong about a
> structural decision is before anything is built on it. An epic whose purpose is to **falsify** a
> decision (to prove the spine holds, or find out early that it doesn't) earns its place at the
> front and is usually deliberately thin. Name the decision it tests, by ADR id or by the HLD section
> that records it.
>
> **`Adopted by`** is a *soft* edge: the epic should land before the ones that adopt it, but must
> never block them. A shared UI foundation is the classic case; without the soft edge it becomes
> either a hard dependency that stalls work, or nothing at all, in which case the same decision gets
> made independently in six places.

| Epic | Delivers | Components touched | Depends on | Parallel-safe with | Adopted by (soft) | Exists to falsify |
|---|---|---|---|---|---|---|
| **E1**: <name> | <the outcome, one line> | <from components.md> | <epic ids, or none> | <epic ids> | <epic ids, or none> | <ADR id / HLD section, or none> |

## Features in this effort (required)
> The features this effort builds or changes, by their index id. Every feature belongs to exactly one
> epic. Keep features comparable in size within an epic.
>
> **`Depends on`** records cross-feature blocking: F4 cannot start until F2's schema lands. These
> edges are **coarse and advisory**: `$thasmorato-skills:tm-tickets` owns the authoritative blocking graph at ticket
> level. What they exist for is the effort-wide view, which ticket edges cannot give because
> `$thasmorato-skills:tm-tickets` reads one FDD at a time and can never see across features.
>
> **`Milestone`** is the scope's (`.scratch/<effort>/scope.md`): a feature is `M1` when it delivers an
> `M1` requirement. The `M1`
> features together must let the persona of the first milestone's scenario reach their goal end to
> end; a missing link is a coverage gap below, not a later epic's problem.

| Feature | Epic | Milestone | Depends on | New or changed |
|---|---|---|---|---|
| **F1**: <slug> | E1 | M1 | <feature ids, or none> | new \| changes F1's living docs |

## Requirement coverage (required)
> The omission direction: every RF/RNF in this effort's scope (the requirements `scope.md` lists as
> added or changed) is owned by at least one feature. List
> here anything **not fully** covered, with the reason: deferred, out of scope, genuinely missed, or
> **partial**.
>
> **Partial coverage is not coverage.** A requirement naming two things, of which a feature delivers
> one, belongs here marked `partial`, not ticked in the index. Half a proof credited as a proof is
> how a requirement gets marked done by a release that does not meet it.

| Requirement | Covered by | Status (covered \| partial \| uncovered) | If not fully covered, why |
|---|---|---|---|

## Divergence: journey vs component (optional)
> Where the user-journey carve-up and the component carve-up disagree. The journey wins the feature
> boundary (a feature must deliver user-visible value), and the disagreement is recorded here because
> it predicts where features will contend for the same component.

## Open questions / Needs Input (optional)
