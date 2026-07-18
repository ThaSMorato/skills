<!--
TEMPLATE: prd (Product Requirements Document)
Filled by the PRD agent from the requirements-brief. States WHAT and WHY — never HOW
(architecture/implementation belong to the HLD/FDD). PRUNE + RENUMBER the optional sections that
don't apply; (required) sections always stay. Product level uses less detail than feature level.
AI practices: NUMBER the requirements (RF-001, RNF-001) for stable references; optionally add a JSON
twin (same info, English keys, empty fields omitted) for deterministic consumption.
-->

# PRD — <name>

## Metadata (required)
- **Level:** product | module (EPIC) | feature
- **ID:** <PRD-xxx>
- **Status:** draft | in review | approved
- **Sources:** <requirements-brief, interview, attached docs>

## Summary and problem context (required)
> What is being built and what problem it solves, in 1–2 paragraphs. Not a loose list of requirements.

## Goals and metrics (required)
> Goals as bullets of the expected outcome + the metric that confirms each (observable impact ≠ technical conclusion).

## Scope (required)
- **In:**
- **Out:**

## Functional requirements (required)
> Concrete capabilities, NUMBERED and verifiable. Not technical design.
- **RF-001** —
- **RF-002** —

## Non-functional requirements (optional)
> Quality/operational constraints (latency, availability, security, limits). Numbered.
- **RNF-001** —

## User flow (optional)
> Expected usage path (order, dependency, logic). Reduces wrong inference.

## Dependencies (optional)
> Systems/modules/services/prior decisions it relies on. Avoids planning as if standalone.

## Acceptance criteria (required)
> Checklist that defines "done" in verifiable conditions (not subjective judgment).
- [ ]

## Risks and considerations (optional)
> Execution uncertainties + notes that don't fit the other sections.

## JSON contract (optional)
> The same information as a structured object (English keys, empty fields omitted) for pipelines/validation.
```json
{}
```
