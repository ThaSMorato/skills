<!--
TEMPLATE: hld (High-Level Design)
Filled by the HLD agent from the PRD. Describes HOW the system is organized as a SYSTEM, not as code:
components, communication, technologies, main patterns — at the C4 container level. It comes AFTER the
PRD (what/why) and BEFORE detailed specs (FDD/LLD). Two failure modes to avoid: becoming a full spec,
or staying so generic it guides no decision. PRUNE + RENUMBER optional sections that don't apply;
(required) sections always stay.
ASSUMPTIONS: a decision the sources do not give is marked `> Assumed:` — or `> Needs Input:` when no
value is defensible — per the `asking` skill (§4 the markers, §6 which values count and the ceiling).
An unmarked one is a validation finding (AS-N).
-->

# HLD — <name>

## Metadata (required)
- **Level:** product | module (EPIC) | feature
- **ID:** <HLD-xxx>
- **Status:** draft | in review | approved
- **Sources:** <prd.md, deep-research, analysis/system-profile.md, attached docs>

> **Level** carries over from the PRD unchanged — the design of a feature is not the design of a
> product, and the chain breaks if it stops here. **Status** starts `draft`; only whoever runs the gate
> moves it, and `/flow` reads it to report what is awaiting approval.

## Objective (required)
> The technical framing of what the PRD asked for — the scope this design covers.

## Overall architecture (required)
> How the system is organized and how the parts connect, at the C4 **container** level (services, APIs, executable blocks and their relations). Reference the C4 C1/C2 diagram if present. Not classes, not full contracts.

## Main components and responsibilities (required)
> **One level below the containers above.** A container is a deployable/runnable thing; a component
> here is a structural unit **inside** a container — the C4 component level, at system scale. If a row
> here repeats a container from the previous section, the section is being filled wrong.
>
> This is the source `/components` turns into the system component map, and the vocabulary every FDD
> then maps its feature onto. Name each component, its container, and the one thing it is responsible
> for.

| Component | Inside container | Responsible for |
|---|---|---|

## Main flows (required)
> The principal request/data flows through the components (the critical paths).

## High-level data model (optional)
> The main entities and relationships, at a high level. Detail belongs to the FDD/LLD.

## Public interfaces (optional)
> What each module exposes to the rest of the system (the boundaries), high-level. Full contracts
> belong to the FDD. State each as a pair: what the module exposes, and what it deliberately keeps
> private — the second half is what makes a leak visible later.

## Cross-cutting concerns (required)
> Architectural drivers that shape the design from the start — do not defer them. Record each as a driver, not a full mechanism.
- **Security:**
- **Scalability:**
- **Availability:**
- **Observability:**

## Non-functional response (required)
> Every `RNF-NNN` in the PRD, and the architectural answer to it. The PRD's non-functional
> requirements are this design's drivers, so an RNF with no row here is a driver that shaped nothing —
> the most expensive omission this document can make, and the one a reader is least likely to notice.
> An RNF that is deliberately not answered yet still gets a row, saying so.

| RNF | Requirement | Architectural response | Where it lives |
|---|---|---|---|

## Architectural decisions (optional)
> Decisions taken at this level and their trade-offs. Link ADRs where they exist; flag real trade-offs as ADR candidates.

## Architectural risks (optional)
> Risks tied to the shape of the solution (e.g. a shared dependency being unavailable, contention, PII in keys).
