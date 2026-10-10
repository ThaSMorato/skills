---
name: interview
description: Relentlessly interview the user, in rounds of questions, to elicit requirements before documenting. Use at the start of a feature or project, or on any "interview / grill / gather requirements" trigger. Composes with the domain-model skill, which sharpens the vocabulary while this one drives the conversation.
---

Interview the user relentlessly until you reach a shared understanding rich enough to write a PRD. Walk the decision tree in **rounds**, as the `asking` skill describes: each round asks the **frontier**, every open decision whose prerequisites are already settled, and holds back any question whose answer depends on another one still open. The answers move the frontier outward; recompute it and ask the next round.

**Format a round** as numbered questions, each with its aim (below), the question, and your recommended answer. With a structured-choice tool, put the frontier's questions in one call up to the tool's limit, the most load-bearing first; the rest open the next round. In plain text:

```
**Q1 · <short title>** (targeting: <section>) <the question, with its options when they are a closed set>
Recommended: <your answer, and why>
```

**Facts are found, never asked.** Before a round, look the answers up in the environment: the code, the project docs (`docs/`, `CONTEXT.md`, `docs/analysis/system-profile.md`), and the tools available. When a fact needs real digging, call the Agent tool with an exploration agent to find it and keep going: only the questions that depend on that fact wait for it, and they join the round after it reports. Only *decisions* go to the user.

**The answer is with someone else.** When a decision belongs to a person who is not in the conversation (a PM, another team, legal), record it in `Open questions` with who holds it, and offer `/questionnaire` to send them the questions instead of guessing.

Cover the minimum a PRD needs: the problem (not the solution), users and jobs-to-be-done, the guiding scenarios, the antithesis, goals and value, success metrics (metric + target), scope and non-goals, constraints, and the open decisions/trade-offs.

## Guiding scenarios
Once the problem and the users are drafted, elicit **one to three guiding scenarios**: a specific persona, their motivation at that moment, and the simulated steps until their goal is met. Read [`scenarios.md`](scenarios.md) for the format, then **shoe-shift** each one with the owner, step by step, and check its persona against the strawman users. The holes it finds become steps, edge cases, or open questions. Name the nonpersonas in the same pass.

**Done when** each scenario passes the shoe-shift (every step has a step before it that makes it possible; the last step is the persona's goal) and no persona is a strawman.

**Inherit rather than re-ask.** When a PRD or HLD already covers this ground (a feature inside an existing product), take the problem, users, goals, guiding scenarios and antithesis from there, show the user what you inherited, and spend the interview on what is genuinely new. A brief that re-derives what the document above it already said will contradict it.

**In brownfield, ask what cannot change.** Every question above asks what is wanted. The more expensive input in an existing system is the immovable: published contracts, persisted schemas, public events, runtime floors. Start from `docs/analysis/system-profile.md`'s inherited constraints, confirm each, and record them in the brief's own inherited-constraints section.

## Aim every question
Each question names **which required section of the brief is weakest right now** and why the question is aimed at it: *"Targeting: Success metrics; there is a goal but no target to confirm it by."* A question that serves no weak section is a question the interview can skip. This keeps every round pointed at the gate instead of at whatever was said last.

## Convergence is counted in the glossary
The interview converges when the **words stop moving**. After each round, look at what its answers did to `CONTEXT.md` (the `domain-model` skill is updating it as you go): how many terms were **created**, and how many **renamed or redefined**. While terms still change, the domain has not settled and a PRD written now would encode a vocabulary that will shift. Report the count as you go (*"glossary: 2 new, 1 renamed"*). Two rounds in a row with no load-bearing term created or changed, together with the gate below, is the signal that the understanding is shared.

## Two challenges, once each
- **Contrarian**, once the problem and the goals are drafted: *what if the opposite were true, or if we built nothing?* It is how an unexamined premise surfaces while it is still one sentence. Ask too *what does the persona use today?*: the product's value is what it adds **over that replacement**, and a useful product can add nothing. The answers are the brief's **Antithesis**.
- **Simplifier**, before scope is settled: *what is the smallest version that would still be worth having?* The answer feeds the gear `/flow` will choose, and becomes the first candidate for Out / non-goals. A general, extensible version earns its place only with **three** distinct, concrete, near-term scenarios behind it; with fewer, scope the specific one the scenarios need.

If two rounds in a row move **no** required section forward, the interview is circling. Ask the **ontological** question instead of another detail: *what is this, really?* A stuck interview is usually stuck on a noun.

Record each challenge and its answer in the brief's **Assumptions challenged** table.

## The ambiguity gate
The gate is countable, not a judgement call: **every `(required)` section of the requirements-brief template is filled**, and everything still unsettled is written into `Open questions`. Nothing generates until that holds and the user confirms the shared understanding has been reached.

**Early exit.** The user may stop before the gate. Then write the brief anyway with `Status: early-exit`, every unfilled required section named under `Open questions`, and say what the PRD will be missing. `/prd` sees the status and carries those gaps forward as `> Needs Input:` instead of filling them.
