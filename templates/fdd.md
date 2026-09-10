<!--
TEMPLATE: fdd (Feature Design Doc)
Filled by the FDD agent, per feature, from the HLD. Descends from architecture to the OPERATIONAL
spec of one feature: runtime behavior, real contracts, config, errors/concurrency, and acceptance
criteria. Detailed enough to guide implementation, but NOT coding-standard prescription or internal
class detail (that's the LLD). The template is a COMPLETENESS CONTRACT — don't leave contracts,
errors, dependencies, or acceptance criteria implicit. PRUNE + RENUMBER optional sections that don't
apply; (required) sections always stay.
-->

# FDD — <feature>

## Metadata (required)
- **ID:** <FDD-xxx>
- **Level:** feature
- **Status:** draft | in review | approved
- **Feature:** <the feature id from docs/features.md, e.g. F3>
- **Components touched:** <names from docs/components.md — the components this feature crosses>
- **Sources:** <hld.md, prd.md, components.md, codebase, deep-research>

> **Components touched** is what ties this feature to the system map. Two FDDs written in parallel
> that touch the same component can specify contracts that contradict each other, and this field is
> what makes that detectable — `/doc-validate` cross-checks the FDDs that share a component. Name
> components exactly as `docs/components.md` names them; if a component you need is missing there,
> say so in Open questions rather than inventing a name.

## Context and goals (required)
> Why this feature exists and what it must achieve. Reference the PRD/HLD; don't restate them.

## Scope and exclusions (required)
> What this feature covers and, explicitly, what it does not.

## Detailed flows (required)
> How the feature behaves at runtime — the paths, step by step. Reference a diagram if one helps.

## Public contracts (required)
> The precise interface: signatures, endpoints, headers, examples, response semantics. Integration depends on precision, not intent.

## Errors, exceptions, and fallbacks (required)
> Specified behavior — not left to the implementer. Each fallback is an operational rule with a trigger condition and an observable effect.

## Config, dependencies, compatibility (optional)
> Valid/invalid options, dependencies as concrete requirements, and explicit compatibility when contract/behavior/adoption changes.

## Test seams / deep modules (required)
> The highest, most stable interface at which this feature will be tested — prefer existing seams, ideally one across the whole feature. A deep module hides a lot behind a small stable interface, giving tests a durable target. This is the bridge to TDD.

## Acceptance criteria (required)
> The core: verifiable conditions under which the feature is correct (contracts ok, tests passing,
> performance/resilience where relevant). Not subjective judgment. Numbered, because `/tickets` copies
> them down and the coverage check follows the ids.
>
> **Precedence.** Acceptance criteria exist in three places — the PRD (product-level), here, and the
> plan's SIs. This document is the **authority for this feature**: it refines the PRD's criteria into
> verifiable ones, and the SIs decompose these. When two disagree, the FDD wins over the PRD and this
> document wins over a plan; a genuine conflict with the PRD is a finding, not something to smooth over.
- [ ] **AC-1** —
- [ ] **AC-2** —

## Open questions / Needs Input (optional)
> Anything this spec could not settle, including components it needed and did not find on the map.

## Risks and mitigation (optional)
> Risks specific to this feature. Observability and cross-cutting risks may be referenced from the HLD, noting how they affect this feature.
