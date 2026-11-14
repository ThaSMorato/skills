---
description: Build and persist the node map for one ticket (deep modules behind small interfaces at clean seams) before planning or coding.
argument-hint: "<ticket file/number, or the work to design>"
disable-model-invocation: true
---

Read `${CLAUDE_PLUGIN_ROOT}/skills/ticket-design/SKILL.md` and follow it to build the node map for: $ARGUMENTS

> Call the Skill tool with `thasmorato-skills:asking` before you report or ask: resolve every id to what it means, offer a structured choice where the answer is a closed set, and ask only what is genuinely a decision.

## Preflight
- Resolve the ticket under `.scratch/<feature-slug>/issues/`. If there is none and the user pointed at no other work, stop and tell them to run `/tm-tickets <feature>` first.
- Run `node "${CLAUDE_PLUGIN_ROOT}/scripts/blocker-state.mjs" <ticket file>` and report each blocker's state from what it prints, per the `asking` skill (§7). A blocker that is not `merged` or `done` is said before the map is built: a design can be drawn against a blocker's planned interface, but that is the owner's call.
- If a node map already exists at `.scratch/<feature-slug>/design/<NN>-<slug>.md`, read it and ask whether to revise it or proceed to `/tm-plan`; silently regenerating it discards decisions the user already confirmed.

## Postflight
After the map is written, show (**grounding first**):

- **How the repo already does this**: the analogues and conventions `pattern-scout` found, and where the new code gets wired in.
- **What already exists** that this ticket can reuse, with paths, and **what the map claims is new**, with the search that justifies each claim. This is the part the human gate should actually read: everything upstream of here is one document derived from another, and this is the first time the repository got a vote.
- If the search shrank the work, say so and offer to amend the ticket before planning.
- **The skeleton of the main artifact** this ticket builds: the endpoint's signature and response, the component's structure, the schema, the job's entry point. One look at the shape is the fastest way for the owner to catch a wrong design.
- Then the nodes with their interfaces, the seams, any **new dependency edge** and whether the boundary contract allows it, the AC-to-node coverage table, and anything left open.

Then tell the user to run `/tm-plan <ticket>`.

This is a gate. The map is where a wrong interface is cheap to fix; after `/tm-plan` it is a re-plan, and after `/tm-implement` it is a rewrite, and a hypothesis that survives this gate gets elaborated by every stage below, because they all check consistency and a wrong-but-consistent map is perfectly consistent.
