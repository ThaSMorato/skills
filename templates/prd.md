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

> **Level** and **Status** are read by other stages, not decoration. **Level** sets the depth of this
> document — `product` states outcomes, `feature` states behavior — and it propagates from the brief.
> **Status** is the gate record: it starts `draft`, and only whoever runs the gate moves it to
> `approved` or `changes-requested`. `/flow` reads it to answer "what is waiting on me?", so a Status
> nobody writes makes the scan lie.

## Summary and problem context (required)
> What is being built and what problem it solves, in 1–2 paragraphs. Not a loose list of requirements.

## Goals and metrics (required)
> Goals as bullets of the expected outcome + the metric that confirms each (observable impact ≠ technical conclusion).

## Scope (required)
> `Out` is not a leftover — it is the second axis on the same statement, and it is where a wrong scope
> reading shows itself. Anything a reader might reasonably assume is in, and isn't, belongs in `Out`.
- **In:**
- **Out:**

## Functional requirements (required)
> Concrete capabilities, NUMBERED and verifiable. Not technical design. Each carries its **origin** —
> the brief section or recorded decision it came from — so the trace is *recorded*, not merely
> promised, and the gate can check it without reading both documents side by side.
> In brownfield, state at the top of this section whether the RFs describe **the delta only** or **the
> whole system**; the two readings produce completely different documents.
- **RF-001** — <requirement> *(from: <brief section>)*
- **RF-002** — <requirement> *(from: <brief section>)*

## Non-functional requirements (optional)
> Quality/operational constraints (latency, availability, security, limits). Numbered, each with its
> origin. These become the HLD's architectural **drivers** — every one of them must get an
> architectural answer, and `/doc-validate` checks exactly that.
- **RNF-001** — <constraint> *(from: <brief section>)*

## User flow (optional)
> Expected usage path (order, dependency, logic). Reduces wrong inference.

## Dependencies (optional)
> Systems/modules/services/prior decisions it relies on. Avoids planning as if standalone.

## Acceptance criteria (required)
> Checklist that defines "done" in verifiable conditions (not subjective judgment).
- [ ]

## Risks and considerations (optional)
> Execution uncertainties + notes that don't fit the other sections.

## JSON contract (required)
> The same information as a structured object (English keys, empty fields omitted), for pipelines and
> validation. It is a **serialization**, and that is its value: it catches structural omission — a
> requirement present in prose and absent here, or the reverse. It does **not** catch a wrong meaning,
> because the same wrong meaning serializes cleanly; that is what the two-axis definitions in
> `CONTEXT.md` are for. `/doc-validate` compares prose against this block.
>
> Give each load-bearing element the formal shape the prose cannot carry: **type**, **cardinality**,
> **allowed values**, **required or not**. Restating the sentence in JSON adds cost and detects nothing.
```json
{}
```
