<!--
TEMPLATE: adr (MADR: Markdown ADR)
Filled by the adr-generator from a confirmed Potential ADR. One decision per ADR. Machine-parseable:
keep the frontmatter fields stable. Never rewrite a past ADR; a new decision is a new ADR.
NO FILES, NO CLASSES: an ADR outlives the code it was written against, so it names components (as
docs/architecture/components.md names them), concepts (as CONTEXT.md names them) and technologies,
never a file path or a class. The evidence with paths stays in the Potential ADR it came from.
LINKS: relative Markdown links to the file, the id as the text
(${CLAUDE_PLUGIN_ROOT}/skills/doc-validate/links.md).
PRUNE optional sections that don't apply; (required) sections always stay.
ASSUMPTIONS: a decision the sources do not give is marked `> Assumed:` (or `> Needs Input:` when no
value is defensible), per the `asking` skill (§4 the markers, §6 which values count and the ceiling).
An unmarked one is a validation finding (AS-N). Each marker is a callout: the line above it is
`> [!CAUTION]` for Needs Input, `> [!WARNING]` for Assumed, `> [!NOTE]` for Decided, and every line
of the marker starts with `> `.
-->
---
kind: adr
status: proposed | accepted | rejected | deprecated | superseded
date: <YYYY-MM-DD>    # when the decision was made
tags: []
scope: repo-wide      # repo-wide | backend | frontend | cross-layer: where the decision binds
subprojects: []       # in a monorepo, the subprojects it binds; empty means all
requirements: []      # the RF/RNF ids it answers (docs/product/prd.md)
features: []          # the feature ids it constrains (docs/features/README.md); each one's row lists this ADR
supersedes: []        # ADR ids this decision replaces
superseded-by: []     # inverse (set when a later ADR replaces this one)
amends: []            # ADR ids this partially adjusts
retroactive: false    # true when the decision was already in the code before it was recorded
discovered: <where it was found, when retroactive: the implementation of a ticket, a review, an analysis>
formalized: <YYYY-MM-DD, the day it was recorded; equal to date unless retroactive>
---

# ADR-NNNN: <short decision title>

## Context and Problem Statement (required)
> The situation and the problem forcing a decision. 1–2 paragraphs, or a question.

## Decision Drivers (optional)
> The forces/criteria that matter (constraints, quality attributes).

## Considered Options (required)
> The options evaluated: **at least two**. One option means the decision was described, not weighed:
> leave the ADR `proposed` with a `> Needs Input:` for the rejected alternative. "Keep the current state"
> counts when it was really on the table. A hybrid nobody proposed is a question to the owner, not an option.
- Option A
- Option B

## Decision Outcome (required)
> The chosen option and the core justification ("Chosen because…").

## Pros and Cons of the Options (required)
> Per option, the trade-offs, the chosen one's cons included; Consequences has to own them.

## Consequences (required)
> What becomes easier and harder as a result (positive and negative).

## References (optional)
> Links to the HLD/FDD/PRD, related ADRs, external sources.
