---
name: architecture
description: A self-contained reference for structure above the class — the six component principles (REP, CCP, CRP, ADP, SDP, SAP), the Main Sequence metrics, the Dependency Rule, boundaries, plugin architecture, and what counts as a detail. Use when deciding where a boundary goes, mapping components, writing a boundary contract, reviewing whether a dependency is legal, or when someone asks "is this architecture any good".
---

# Architecture

SOLID arranges **classes**. This skill is the next step up: how classes are grouped into **components** (independently releasable units) and how those components may depend on each other. The rules change shape at this scale — a principle that is binary for a class becomes a matter of **degree** for a component.

Two things make architecture different from code review:

- **It is not diff-scoped.** You cannot see a dependency cycle in a diff. Most of this material is design-time (where does the boundary go?) or repo-time (does the graph still obey the contract?), not hunk-time.
- **Part of it is computable.** Instability, abstractness, distance from the Main Sequence and cycle detection are graph arithmetic over imports, not judgement. Prefer the number where a number exists — see `rules/metrics.md`.

Read a rule file **only when its row matches** what you are deciding.

## Component cohesion — what belongs together
| Principle | The question it answers | Rule |
|---|---|---|
| REP — Reuse/Release Equivalence | can this be released and reused as a unit? | `rules/rep-reuse-release.md` |
| CCP — Common Closure | do these change together, for the same reason? | `rules/ccp-common-closure.md` |
| CRP — Common Reuse | are consumers forced to depend on what they don't use? | `rules/crp-common-reuse.md` |
| The tension between the three | which one to favour, and when | `rules/cohesion-tension.md` |

## Component coupling — how they may depend
| Principle | The question it answers | Rule |
|---|---|---|
| ADP — Acyclic Dependencies | can each component still be released independently? | `rules/adp-acyclic.md` |
| SDP — Stable Dependencies | does this dependency point toward something more stable? | `rules/sdp-stable-dependencies.md` |
| SAP — Stable Abstractions | is this stable component abstract enough to extend? | `rules/sap-stable-abstractions.md` |
| Main Sequence, Zone of Pain, Zone of Uselessness | how far off is each component, numerically? | `rules/main-sequence.md` |
| Computing I, A, D and cycles | how to get those numbers from a repo | `rules/metrics.md` |

## Architecture — the shape of the whole
| Topic | The question it answers | Rule |
|---|---|---|
| The Dependency Rule | which way may a source-code dependency point? | `rules/dependency-rule.md` |
| Boundaries — where and when | where does a boundary go, and when do you draw it? | `rules/boundaries.md` |
| Partial boundaries | how do you buy optionality without paying full price? | `rules/partial-boundaries.md` |
| Plugin architecture | how does the stable side stay ignorant of the volatile one? | `rules/plugin-architecture.md` |
| The level graph | what does "high level" actually mean? | `rules/level-graph.md` |
| Screaming architecture | what should the directory structure announce? | `rules/screaming-architecture.md` |
| The circles | what the concentric-circle diagram does and does not say | `rules/clean-architecture.md` |
| Services are not architecture | does splitting into services decouple anything? | `rules/services-not-architecture.md` |
| The database is a detail | what is the schema allowed to dictate? | `rules/detail-database.md` |
| The web is a detail | what is the delivery mechanism allowed to dictate? | `rules/detail-web.md` |
| Frameworks are details | how much of the framework may reach the policy? | `rules/detail-framework.md` |

## Two calibrations, before you use any of it

**Aim, don't grade.** These are directions, not scores. Every real system violates several at once, and the useful question is never "does this comply" but "is the next change moving toward or away". A report that lists twelve principle violations in a working system has said nothing actionable.

**A boundary is stack-specific.** A component is a Rails engine, an Nx workspace package, a Go module, a NestJS module, a Cargo crate — the ecosystem decides what "independently releasable" can even mean. Read the repo's stack guide before asserting that something should be its own component; the abstract principle cannot tell you what the packaging unit is.
