<!--
TEMPLATE: prd (Product Requirements Document)
Filled by the PRD agent from the requirements-brief. States WHAT and WHY, never HOW
(architecture/implementation belong to the HLD/FDD). PRUNE + RENUMBER the optional sections that
don't apply; (required) sections always stay. Product level uses less detail than feature level.
AI practices: NUMBER the requirements (RF-001, RNF-001) for stable references; optionally add a JSON
twin (same info, English keys, empty fields omitted) for deterministic consumption.
ASSUMPTIONS: a decision the sources do not give is marked `> Assumed:` (or `> Needs Input:` when no
value is defensible), per the `asking` skill (§4 the markers, §6 which values count and the ceiling).
An unmarked one is a validation finding (AS-N).
-->

# PRD: <name>

## Metadata (required)
- **Level:** product | module (EPIC) | feature
- **ID:** <PRD-xxx>
- **Status:** draft | in review | approved
- **Sources:** <requirements-brief, interview, attached docs>

> **Level** and **Status** are read by other stages, not decoration. **Level** sets the depth of this
> document (`product` states outcomes, `feature` states behavior) and it propagates from the brief.
> **Status** is the gate record: it starts `draft`, and only whoever runs the gate moves it to
> `approved` or `changes-requested`. `/flow` reads it to answer "what is waiting on me?", so a Status
> nobody writes makes the scan lie.

## Summary and problem context (required)
> What is being built and what problem it solves, in 1–2 paragraphs. Not a loose list of requirements.

## Design principles (required)
> The summary of what the design optimizes for, above the detail: which persona wins when two
> disagree, what is traded for what (ease of use over flexibility, revenue over reach). It is what a
> reader who will never walk every requirement can still check a decision against.

## Guiding scenarios (required)
> The brief's guiding scenarios, carried over with their ids (`GS-N`), persona, motivation and
> numbered steps. Every requirement below is a slice of one of them.

## Goals and metrics (required)
> Goals as bullets of the expected outcome + the metric that confirms each (observable impact ≠ technical conclusion).

## Scope (required)
> `Out` is not a leftover; it is the second axis on the same statement, and it is where a wrong scope
> reading shows itself. Anything a reader might reasonably assume is in, and isn't, belongs in `Out`.
- **In:**
- **Out:** <scope left out, and **who**: the brief's nonpersonas>

## Functional requirements (required)
> Concrete capabilities, NUMBERED and verifiable. Not technical design. Each carries its **origin**:
> the brief section or recorded decision it came from, so the trace is *recorded*, not merely
> promised, and the gate can check it without reading both documents side by side.
> In brownfield, state at the top of this section whether the RFs describe **the delta only** or **the
> whole system**; the two readings produce completely different documents.
>
> Write each from the user's side, and keep the motivation: **"<persona> can <action> so that
> <motivation>"**, or **"<the product> provides <capability> so that <persona> can <value>"**. A
> requirement without its "so that" has lost the scenario it came from. State **what** must happen,
> never how. Tag each with the scenario step it slices (`GS-1.3`), `edge` when it is an edge case of
> that step, and the milestone it belongs to.
- **RF-001** `GS-1.2` `M1`: <persona> can <action> so that <motivation> *(from: <brief section>)*
- **RF-002** `GS-1.4` `edge` `M2`: <requirement> *(from: <brief section>)*

## Non-functional requirements (optional)
> Quality/operational constraints (latency, availability, security, limits). Numbered, each with its
> origin. These become the HLD's architectural **drivers**: every one of them must get an
> architectural answer, and `/doc-validate` checks exactly that.
> Each names the scenario step it **protects** (where the user would feel it break): latency that
> matters is on an operation the persona actively waits for. An RNF that protects no scenario is
> optimizing where it is easy to look, not where the user is; keep it only with the reason in Risks.
- **RNF-001** `protects: GS-1.3`: <constraint> *(from: <brief section>)*

## First milestone (required)
> The first release is **one guiding scenario completed end to end** (a walking skeleton: thin, but
> the persona reaches their goal), or the smallest set of scenarios that is worth having. Name it,
> and list the requirements tagged `M1` that complete it. A milestone that delivers pieces of three
> scenarios and finishes none ships nothing a user can do.
- **Completes:** GS-<n>
- **Requirements:** RF-<…>

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
> validation. It is a **serialization**, and that is its value: it catches structural omission: a
> requirement present in prose and absent here, or the reverse. It does **not** catch a wrong meaning,
> because the same wrong meaning serializes cleanly; that is what the two-axis definitions in
> `CONTEXT.md` are for. `/doc-validate` compares prose against this block.
>
> Give each load-bearing element the formal shape the prose cannot carry: **type**, **cardinality**,
> **allowed values**, **required or not**. Restating the sentence in JSON adds cost and detects nothing.
>
> The scenario links are structure, so they belong here: each requirement's `scenarioStep` (`GS-1.3`),
> `edge` and `milestone`; each RNF's `protects`; the first milestone's `completes` and its requirement
> ids. That is what lets `/doc-validate` walk scenario coverage mechanically.
```json
{}
```
