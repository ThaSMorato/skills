<!--
TEMPLATE: requirements-brief
Output of the interview (N0). This is NOT the PRD; it is the aligned understanding the PRD agent
consumes (its isolated context can't see the conversation). Fill the sections; PRUNE + RENUMBER the
optional ones that don't apply. Sections marked (required) always stay. Each `>` is the section's
intent; delete it when you fill the section.
ASSUMPTIONS: a decision the sources do not give is marked `> Assumed:` (or `> Needs Input:` when no
value is defensible), per the `asking` skill (§4 the markers, §6 which values count and the ceiling).
An unmarked one is a validation finding (AS-N).
-->

# Requirements Brief: <feature/project name>

## Metadata (required)
> Identity and scope of the brief.
- **Level:** product | module | feature
- **Date:** <YYYY-MM-DD>
- **Author(s):** <who>
- **Status:** draft | aligned | early-exit; `early-exit` when the user stopped before the gate; the gaps are in Open questions
- **Glossary at close:** <terms created / renamed in the last two answers, e.g. `0 / 0`>

## Problem (required)
> The concrete pain that motivates this: the problem, not the solution ("too many requests take the system down", not "build a rate limiter").

## Users and jobs-to-be-done (required)
> Who uses it and what they need to accomplish. Relevant personas/actors.
- **Not for (nonpersonas):** who this deliberately does not serve, at least for now.

## Guiding scenarios (required)
> One to three stories, each a specific persona with a motivation, simulated step by step until their
> goal is met, in the format of `${CLAUDE_PLUGIN_ROOT}/skills/interview/scenarios.md`. Every later stage
> carries these forward: the PRD slices them into requirements and picks one as the first milestone.

### GS-1: <the outcome, in the persona's words>
- **Persona:**
- **Motivation:**
- **Simulation:**
  1.
- **Edge cases met on the way:**

## Antithesis (required)
> Why this might be wrong, written by the Contrarian challenge. A brief that only argues for the idea is a
> pitch. For a feature inside an existing product, inherit it from the brief above and say so.
- **Why it might fail:** <the audience does not care, the cost does not close, the premise is false>
- **What the persona uses today:** <the replacement, and what this adds over it>

## Goals and value (required)
> Expected, observable outcome: the product/business value, not just "it works".

## Success metrics (required)
> How the outcome is confirmed (metric + target, e.g. "P95 < 150 ms", "429s < 1%").

## Scope (required)
> The boundary of the delivery, kept objective (ambiguity becomes rework).
- **In:**
- **Out / non-goals:**

## Constraints (optional)
> Quality/operational/business/compliance limits (latency, availability, multi-tenant, GDPR…).

## Inherited constraints (optional, brownfield)
> What **cannot change**, because a system already exists: published contracts, persisted schemas,
> public events, runtime floors, integrations others depend on. Every other section says what is
> wanted; this one says what is immovable, which in legacy is the more expensive input to get wrong.
> Source it from `docs/analysis/system-profile.md` when it exists, and confirm each with the user.

| What | Why it can't change | Evidence |
|---|---|---|

## Assumptions challenged (optional)
> The Contrarian and Simplifier questions, and any ontological one, with what they changed.

| Assumption | Challenge | Resolution |
|---|---|---|

## Recorded decisions (optional)
> Trade-offs already resolved during the interview. Link the ADRs emitted inline (e.g. `docs/adr/0003-*.md`).

## Open questions / Needs Input (required)
> What is still undefined. The ambiguity gate only passes when nothing critical remains here.

## Glossary (optional)
> Key terms and their canonical definition (or point to `CONTEXT.md`, which owns them). Terms that a
> later stage will act on are **load-bearing** and get two descriptions on different axes; see the
> `Load-bearing terms` section of `CONTEXT.md`.
