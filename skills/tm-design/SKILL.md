---
name: tm-design
description: Build and persist the node map for one ticket (deep modules behind small interfaces at clean seams) before planning or coding.
argument-hint: "<ticket file/number, or the work to design>"
user-invocable: false
---

Load skill `thasmorato-skills:ticket-design` to build the node map for: the owner's supplied arguments

> Load skill `thasmorato-skills:asking` before you report or ask: resolve every id to what it means, offer a structured choice where the answer is a closed set, and ask only what is genuinely a decision.

## Preflight
- Resolve the ticket under `.scratch/<feature-slug>/issues/`. If there is none and the user pointed at no other work, stop and tell them to run `/tm-tickets <feature>` first.
- If a node map already exists at `.scratch/<feature-slug>/design/<NN>-<slug>.md`, read it and ask whether to revise it or proceed to `/tm-plan`; silently regenerating it discards decisions the user already confirmed.

## Postflight
After the map is written, show (**grounding first**):

- **How the repo already does this**: the analogues and conventions `pattern-scout` found, and where the new code gets wired in.
- **What already exists** that this ticket can reuse, with paths, and **what the map claims is new**, with the search that justifies each claim. This is the part the human gate should actually read: everything upstream of here is one document derived from another, and this is the first time the repository got a vote.
- If the search shrank the work, say so and offer to amend the ticket before planning.
- Then the nodes with their interfaces, the seams, any **new dependency edge** and whether the boundary contract allows it, the AC-to-node coverage table, and anything left open.

Then tell the user to run `/tm-plan <ticket>`.

This is a gate. The map is where a wrong interface is cheap to fix; after `/tm-plan` it is a re-plan, and after `/tm-implement` it is a rewrite, and a hypothesis that survives this gate gets elaborated by every stage below, because they all check consistency and a wrong-but-consistent map is perfectly consistent.

## Stage boundary
Deliver this stage's artifact, name the next command as a recommendation to the owner, and stop the turn. Never invoke another stage, repeat this stage, or ask another agent/harness to perform the next stage. A dirty verdict is a report, never an automatic fix/revalidate loop. Only `/tm-flow` may coordinate transitions, each after an explicit owner gate. A subagent does its assigned work itself and never delegates again.

## Codex adapter (generated)
Load core skills by opening their SKILL.md from this plugin, stripping `thasmorato-skills:` from the logical name. For delegation use the available spawn tool with the named agent's instructions from `../../agent-specs/<name>.md`; if the client has registered the generated TOML agents, use those. Parallelize independent read-only lenses within the host concurrency limit, queueing remaining lenses. A subagent never delegates again. If delegation is unavailable, disclose that and execute each requested lens serially, preserving separate evidence. Never silently drop a lens. Use numbered choices if the host has no wizard.
