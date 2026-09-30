---
name: interview
description: Relentlessly interview the user to elicit requirements before documenting. Use at the start of a feature or project, or on any "interview / grill / gather requirements" trigger. Composes with the domain-model skill, which sharpens the vocabulary while this one drives the conversation.
---

Interview the user relentlessly until you reach a shared understanding rich enough to write a PRD. Walk down the decision tree branch by branch, resolving dependencies between decisions one at a time.

Ask one question at a time, waiting for the answer before the next — asking several at once is bewildering. Each question comes with your recommended answer.

Before asking, look up the answer in the environment: the code, the project docs (`docs/`, `CONTEXT.md`, `docs/analysis/system-profile.md`), and the tools available. Only *decisions* go to the user; *facts* you discover.

Cover the minimum a PRD needs: the problem (not the solution), users and jobs-to-be-done, goals and value, success metrics (metric + target), scope and non-goals, constraints, and the open decisions/trade-offs.

**Inherit rather than re-ask.** When a PRD or HLD already covers this ground — a feature inside an existing product — take the problem, users and goals from there, show the user what you inherited, and spend the interview on what is genuinely new. A brief that re-derives what the document above it already said will contradict it.

**In brownfield, ask what cannot change.** Every question above asks what is wanted. The more expensive input in an existing system is the immovable: published contracts, persisted schemas, public events, runtime floors. Start from `docs/analysis/system-profile.md`'s inherited constraints, confirm each, and record them in the brief's own inherited-constraints section.

## Aim every question
Before each question, name **which required section of the brief is weakest right now** and why this question is aimed at it: *"Targeting: Success metrics — there is a goal but no target to confirm it by."* A question that serves no weak section is a question the interview can skip. This keeps the tree walk pointed at the gate instead of at whatever was said last.

## Convergence is counted in the glossary
The interview converges when the **words stop moving**. After each answer, look at what it did to `CONTEXT.md` (the `domain-model` skill is updating it as you go): how many terms were **created**, and how many **renamed or redefined**. While terms still change, the domain has not settled and a PRD written now would encode a vocabulary that will shift. Report the count as you go (*"glossary: 2 new, 1 renamed"*). Two answers in a row with no load-bearing term created or changed, together with the gate below, is the signal that the understanding is shared.

## Two challenges, once each
- **Contrarian**, once the problem and the goals are drafted: *what if the opposite were true, or if we built nothing?* It is how an unexamined premise surfaces while it is still one sentence.
- **Simplifier**, before scope is settled: *what is the smallest version that would still be worth having?* The answer feeds the gear `/flow` will choose, and becomes the first candidate for Out / non-goals.

If two answers in a row move **no** required section forward, the interview is circling. Ask the **ontological** question instead of another detail: *what is this, really?* A stuck interview is usually stuck on a noun.

Record each challenge and its answer in the brief's **Assumptions challenged** table.

## The ambiguity gate
The gate is countable, not a judgement call: **every `(required)` section of the requirements-brief template is filled**, and everything still unsettled is written into `Open questions`. Nothing generates until that holds and the user confirms the shared understanding has been reached.

**Early exit.** The user may stop before the gate. Then write the brief anyway with `Status: early-exit`, every unfilled required section named under `Open questions`, and say what the PRD will be missing. `/prd` sees the status and carries those gaps forward as `> Needs Input:` instead of filling them.
