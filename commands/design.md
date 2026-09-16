---
description: Build and persist the node map for one ticket — deep modules behind small interfaces at clean seams — before planning or coding.
argument-hint: <ticket file/number, or the work to design>
---

Use the `design` skill to build the node map for: $ARGUMENTS

> Load the `asking` skill before you report or ask: resolve every id to what it means, offer a structured choice where the answer is a closed set, and ask only what is genuinely a decision.

## Preflight
- Resolve the ticket under `.scratch/<feature-slug>/issues/`. If there is none and the user pointed at no other work, stop and tell them to run `/tickets <feature>` first.
- If a node map already exists at `.scratch/<feature-slug>/design/<NN>-<slug>.md`, read it and ask whether to revise it or proceed to `/plan` — silently regenerating it discards decisions the user already confirmed.

## Postflight
After the map is written, show — **grounding first**:

- **What already exists** that this ticket can reuse, with paths, and **what the map claims is new**, with the search that justifies each claim. This is the part the human gate should actually read: everything upstream of here is one document derived from another, and this is the first time the repository got a vote.
- If the search shrank the work, say so and offer to amend the ticket before planning.
- Then the nodes with their interfaces, the seams, any **new dependency edge** and whether the boundary contract allows it, the AC-to-node coverage table, and anything left open.

Then tell the user to run `/plan <ticket>`.

This is a gate. The map is where a wrong interface is cheap to fix; after `/plan` it is a re-plan, and after `/implement` it is a rewrite — and a hypothesis that survives this gate gets elaborated by every stage below, because they all check consistency and a wrong-but-consistent map is perfectly consistent.
