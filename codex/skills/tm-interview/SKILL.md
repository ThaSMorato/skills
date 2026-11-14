---
name: tm-interview
description: "Open the Doc-Dev flow with the requirements interview, producing the brief, glossary, and ADRs."
---

> **Codex.** Paths that start with `references/` are inside this skill's folder (the folder of this `SKILL.md`);
> in a shell command, write them as absolute paths. A stage named `$thasmorato-skills:tm-<name>` is another entry
> of this plugin: tell the owner to run it, never run it yourself.

**Argument** (the text after the skill name): [feature or project name]


Read `references/skills/interview/index.md` and follow it (the elicitation discipline: rounds of questions, the PRD checklist, the gate), then read the `domain-model` skill (`references/skills/domain-model/index.md`) (the glossary and the inline ADRs). They compose: `interview` drives the conversation, `domain-model` sharpens the vocabulary as it goes. Loading only one silently drops half the stage.

Elicit requirements for: the text after the skill name

> Read the `asking` skill (`references/skills/asking/index.md`) before you report or ask: resolve every id to what it means, offer a structured choice where the answer is a closed set, and ask only what is genuinely a decision.

## Before the first question
- Read `docs/analysis/system-profile.md` if it exists. Its **Inherited constraints** section is the input a greenfield interview never needs and a brownfield one cannot do without: the immovable, as opposed to the desired. Confirm each with the user rather than assuming it still binds.
- Read `docs/product/prd.md` and `docs/architecture/hld.md` if they exist. When the argument names a **feature inside an existing product**, the problem, the users and the goals are already settled upstream: **inherit them and say so**, then elicit only what is new. Re-eliciting produces a brief that contradicts the document above it.

## The gate
The template marks eight sections `(required)`: Problem, Users and jobs-to-be-done, Guiding scenarios, Antithesis, Goals and value, Success metrics, Scope, Open questions. The gate is **countable**: every required section filled, and everything still unsettled written down in Open questions. Then the user confirms the shared understanding. Along the way, each question names the weakest required section it targets, and each round reports what it did to the glossary (terms created / renamed); two rounds in a row that change no load-bearing term is the convergence signal. A decision held by someone outside the conversation goes to `Open questions` with its holder, and `$thasmorato-skills:tm-questionnaire` can send it. If the user stops early, persist anyway with `Status: early-exit`.

## Name the effort
Before persisting, ask the owner for the effort's slug once (a short kebab name for this work, e.g. `checkout-v2`; offer one built from the argument): it is the folder under `.scratch/` that holds what dies with the effort, the brief and the decomposition. The living documents (`docs/product/`, `docs/features/`) are the system's and outlive it.

## Persist
Once the gate passes, write the artifacts the `$thasmorato-skills:tm-prd` agent will consume (its isolated context cannot see this conversation):

- `.scratch/<effort>/brief.md`: fill `references/templates/requirements-brief.md`, pruning and renumbering the optional sections that don't apply. Set `Status: aligned`, or `early-exit` when the user stopped before the gate.
- `CONTEXT.md`: the glossary, including the two-axis definitions for load-bearing terms.
- `docs/adr/NNNN-*.md`: any ADRs emitted inline during the interview. Allocate numbers per the rule in `$thasmorato-skills:tm-adr-generate`: the next free number across both `docs/adr/*.md` and `docs/adr/potential/`, four digits.

Do NOT write the PRD here; that is the `$thasmorato-skills:tm-prd` step.
