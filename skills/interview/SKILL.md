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

## The ambiguity gate
The gate is countable, not a judgement call: **every `(required)` section of the requirements-brief template is filled**, and everything still unsettled is written into `Open questions`. Nothing generates until that holds and the user confirms the shared understanding has been reached.
