---
description: Open the Doc-Dev flow with the requirements interview, producing the brief, glossary, and ADRs.
argument-hint: "[feature or project name]"
---

Call the Skill tool with `interview` (the elicitation discipline: rounds of questions, the PRD checklist, the gate), then with `domain-model` (the glossary and the inline ADRs). They compose: `interview` drives the conversation, `domain-model` sharpens the vocabulary as it goes. Loading only one silently drops half the stage.

Elicit requirements for: $ARGUMENTS

> Call the Skill tool with `asking` before you report or ask: resolve every id to what it means, offer a structured choice where the answer is a closed set, and ask only what is genuinely a decision.

## Before the first question
- Read `docs/analysis/system-profile.md` if it exists. Its **Inherited constraints** section is the input a greenfield interview never needs and a brownfield one cannot do without: the immovable, as opposed to the desired. Confirm each with the user rather than assuming it still binds.
- Read `docs/prd.md` and `docs/hld.md` if they exist. When the argument names a **feature inside an existing product**, the problem, the users and the goals are already settled upstream: **inherit them and say so**, then elicit only what is new. Re-eliciting produces a brief that contradicts the document above it.

## The gate
The template marks eight sections `(required)`: Problem, Users and jobs-to-be-done, Guiding scenarios, Antithesis, Goals and value, Success metrics, Scope, Open questions. The gate is **countable**: every required section filled, and everything still unsettled written down in Open questions. Then the user confirms the shared understanding. Along the way, each question names the weakest required section it targets, and each round reports what it did to the glossary (terms created / renamed); two rounds in a row that change no load-bearing term is the convergence signal. A decision held by someone outside the conversation goes to `Open questions` with its holder, and `/questionnaire` can send it. If the user stops early, persist anyway with `Status: early-exit`.

## Persist
Once the gate passes, write the artifacts the `/prd` agent will consume (its isolated context cannot see this conversation):

- `docs/requirements-brief.md`: fill `${CLAUDE_PLUGIN_ROOT}/templates/requirements-brief.md`, pruning and renumbering the optional sections that don't apply. Set `Status: aligned`, or `early-exit` when the user stopped before the gate.
- `CONTEXT.md`: the glossary, including the two-axis definitions for load-bearing terms.
- `docs/adr/NNNN-*.md`: any ADRs emitted inline during the interview. Allocate numbers per the rule in `/adr-generate`: the next free number across both `docs/adr/*.md` and `docs/adr/potential/`, four digits.

Do NOT write the PRD here; that is the `/prd` step.
