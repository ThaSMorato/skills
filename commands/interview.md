---
description: Open the Doc-Dev flow with the requirements interview, producing the brief, glossary, and ADRs.
argument-hint: [feature or project name]
---

Run an `interview` session using the `domain-model` skill, to elicit requirements for: $ARGUMENTS

Once the ambiguity gate passes — no critical PRD input is undefined and the user confirms the shared understanding — PERSIST the artifacts the `/prd` agent will consume (its isolated context cannot see this conversation):

- `docs/requirements-brief.md` — fill the skeleton at `${CLAUDE_PLUGIN_ROOT}/templates/requirements-brief.md`, pruning and renumbering the optional sections that don't apply.
- `CONTEXT.md` — the glossary.
- `docs/adr/NNNN-*.md` — any ADRs emitted inline during the interview.

Do NOT write the PRD here — that is the `/prd` step.
