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
- **Status:** draft | in review | approved
- **Sources:** <hld.md, prd.md, codebase, deep-research>

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
> The core: verifiable conditions under which the feature is correct (contracts ok, tests passing, performance/resilience where relevant). Not subjective judgment.
- [ ]

## Risks and mitigation (optional)
> Risks specific to this feature. Observability and cross-cutting risks may be referenced from the HLD, noting how they affect this feature.
