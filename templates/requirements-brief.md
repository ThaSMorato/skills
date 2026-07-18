<!--
TEMPLATE: requirements-brief
Output of the interview (N0). This is NOT the PRD — it is the aligned understanding the PRD agent
consumes (its isolated context can't see the conversation). Fill the sections; PRUNE + RENUMBER the
optional ones that don't apply. Sections marked (required) always stay. Each `>` is the section's
intent — delete it when you fill the section.
-->

# Requirements Brief — <feature/project name>

## Metadata (required)
> Identity and scope of the brief.
- **Level:** product | module | feature
- **Date:** <YYYY-MM-DD>
- **Author(s):** <who>
- **Status:** draft | aligned

## Problem (required)
> The concrete pain that motivates this — the problem, not the solution ("too many requests take the system down", not "build a rate limiter").

## Users and jobs-to-be-done (required)
> Who uses it and what they need to accomplish. Relevant personas/actors.

## Goals and value (required)
> Expected, observable outcome — the product/business value, not just "it works".

## Success metrics (required)
> How the outcome is confirmed (metric + target, e.g. "P95 < 150 ms", "429s < 1%").

## Scope (required)
> The boundary of the delivery, kept objective (ambiguity becomes rework).
- **In:**
- **Out / non-goals:**

## Constraints (optional)
> Quality/operational/business/compliance limits (latency, availability, multi-tenant, GDPR…).

## Recorded decisions (optional)
> Trade-offs already resolved during the interview. Link the ADRs emitted inline (e.g. `docs/adr/0003-*.md`).

## Open questions / Needs Input (required)
> What is still undefined. The ambiguity gate only passes when nothing critical remains here.

## Glossary (optional)
> Key terms and their canonical definition (or point to `CONTEXT.md`).
