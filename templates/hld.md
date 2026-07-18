<!--
TEMPLATE: hld (High-Level Design)
Filled by the HLD agent from the PRD. Describes HOW the system is organized as a SYSTEM, not as code:
components, communication, technologies, main patterns — at the C4 container level. It comes AFTER the
PRD (what/why) and BEFORE detailed specs (FDD/LLD). Two failure modes to avoid: becoming a full spec,
or staying so generic it guides no decision. PRUNE + RENUMBER optional sections that don't apply;
(required) sections always stay.
-->

# HLD — <name>

## Metadata (required)
- **ID:** <HLD-xxx>
- **Status:** draft | in review | approved
- **Sources:** <prd.md, deep-research, attached docs>

## Objective (required)
> The technical framing of what the PRD asked for — the scope this design covers.

## Overall architecture (required)
> How the system is organized and how the parts connect, at the C4 **container** level (services, APIs, executable blocks and their relations). Reference the C4 C1/C2 diagram if present. Not classes, not full contracts.

## Main components and responsibilities (required)
> The relevant components/modules and what each is responsible for.

## Main flows (required)
> The principal request/data flows through the components (the critical paths).

## High-level data model (optional)
> The main entities and relationships, at a high level. Detail belongs to the FDD/LLD.

## Public interfaces (optional)
> What each module exposes to the rest of the system (the boundaries), high-level. Full contracts belong to the FDD.

## Cross-cutting concerns (required)
> Architectural drivers that shape the design from the start — do not defer them. Record each as a driver, not a full mechanism.
- **Security:**
- **Scalability:**
- **Availability:**
- **Observability:**

## Architectural decisions (optional)
> Decisions taken at this level and their trade-offs. Link ADRs where they exist; flag real trade-offs as ADR candidates.

## Architectural risks (optional)
> Risks tied to the shape of the solution (e.g. a shared dependency being unavailable, contention, PII in keys).
