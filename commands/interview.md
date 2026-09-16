---
description: Open the Doc-Dev flow with the requirements interview, producing the brief, glossary, and ADRs.
argument-hint: "[feature or project name]"
---

Load **both** the `interview` skill (the elicitation discipline — one question at a time, the PRD checklist, the gate) and the `domain-model` skill (the glossary and the inline ADRs). They compose: `interview` drives the conversation, `domain-model` sharpens the vocabulary as it goes. Loading only one silently drops half the stage.

Elicit requirements for: $ARGUMENTS

> Load the `asking` skill before you report or ask: resolve every id to what it means, offer a structured choice where the answer is a closed set, and ask only what is genuinely a decision.

## Before the first question
- Read `docs/analysis/system-profile.md` if it exists. Its **Inherited constraints** section is the input a greenfield interview never needs and a brownfield one cannot do without — the immovable, as opposed to the desired. Confirm each with the user rather than assuming it still binds.
- Read `docs/prd.md` and `docs/hld.md` if they exist. When the argument names a **feature inside an existing product**, the problem, the users and the goals are already settled upstream — **inherit them and say so**, then elicit only what is new. Re-eliciting produces a brief that contradicts the document above it.

## The gate
The template marks six sections `(required)`: Problem, Users and JTBD, Goals and value, Success metrics, Scope, Open questions. The gate is **countable**: every required section filled, and everything still unsettled written down in Open questions. Then the user confirms the shared understanding.

## Persist
Once the gate passes, write the artifacts the `/prd` agent will consume — its isolated context cannot see this conversation:

- `docs/requirements-brief.md` — fill `${CLAUDE_PLUGIN_ROOT}/templates/requirements-brief.md`, pruning and renumbering the optional sections that don't apply. Set `Status: aligned`.
- `CONTEXT.md` — the glossary, including the two-axis definitions for load-bearing terms.
- `docs/adr/NNNN-*.md` — any ADRs emitted inline during the interview. Allocate numbers per the rule in `/adr-generate`: the next free number across both `docs/adr/*.md` and `docs/adr/potential/`, four digits.

Do NOT write the PRD here — that is the `/prd` step.
