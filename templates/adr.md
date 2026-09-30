<!--
TEMPLATE: adr (MADR — Markdown ADR)
Filled by the adr-generator from a confirmed Potential ADR. One decision per ADR. Machine-parseable:
keep the frontmatter fields stable. Never rewrite a past ADR — a new decision is a new ADR.
PRUNE optional sections that don't apply; (required) sections always stay.
ASSUMPTIONS: a decision the sources do not give is marked `> Assumed:` — or `> Needs Input:` when no
value is defensible — per the `asking` skill (§4 the markers, §6 which values count and the ceiling).
An unmarked one is a validation finding (AS-N).
-->
---
status: proposed | accepted | rejected | deprecated | superseded
date: <YYYY-MM-DD>
tags: []
supersedes: []        # ADR ids this decision replaces
superseded-by: []     # inverse (set when a later ADR replaces this one)
amends: []            # ADR ids this partially adjusts
---

# ADR-NNNN — <short decision title>

## Context and Problem Statement (required)
> The situation and the problem forcing a decision. 1–2 paragraphs, or a question.

## Decision Drivers (optional)
> The forces/criteria that matter (constraints, quality attributes).

## Considered Options (required)
> The options evaluated — **at least two**. One option means the decision was described, not weighed:
> leave the ADR `proposed` with a `> Needs Input:` for the rejected alternative. "Keep the current state"
> counts when it was really on the table. A hybrid nobody proposed is a question to the owner, not an option.
- Option A
- Option B

## Decision Outcome (required)
> The chosen option and the core justification ("Chosen because…").

## Pros and Cons of the Options (required)
> Per option, the trade-offs — the chosen one's cons included; Consequences has to own them.

## Consequences (required)
> What becomes easier and harder as a result (positive and negative).

## References (optional)
> Links to the HLD/FDD/PRD, related ADRs, external sources.
