---
name: tm-prototype
description: Answer one design question with throwaway code (a clickable HTML demo of a state model, or switchable UI variants on the real page), record the answer where the design was waiting for it, and keep the code off the working branch.
argument-hint: "<the question, e.g. can an order be partly cancelled after a shipment left?>"
user-invocable: false
---

Load skill `thasmorato-skills:prototype` for: the owner's supplied arguments

> Load skill `thasmorato-skills:asking` before you report or ask: resolve every id to what it means, offer a structured choice where the answer is a closed set, and ask only what is genuinely a decision.

Preflight: there is one question, and it is a design question (logic or UI). "Build the feature" is not one: point at `/tm-design`. More than one question is more than one prototype; ask which comes first.

Postflight: the question, how to open the prototype (the file or the URL and command), and once answered, the path to the prototype file, where the answer landed as a `Decided` marker, and what happened to the code (throwaway branch or deleted).

## Stage boundary
Deliver this stage's artifact, name the next command as a recommendation to the owner, and stop the turn. Never invoke another stage, repeat this stage, or ask another agent/harness to perform the next stage. A dirty verdict is a report, never an automatic fix/revalidate loop. Only `/tm-flow` may coordinate transitions, each after an explicit owner gate. A subagent does its assigned work itself and never delegates again.

## Codex adapter (generated)
Load core skills by opening their SKILL.md from this plugin, stripping `thasmorato-skills:` from the logical name. For delegation use the available spawn tool with the named agent's instructions from `../../agent-specs/<name>.md`; if the client has registered the generated TOML agents, use those. Parallelize independent read-only lenses within the host concurrency limit, queueing remaining lenses. A subagent never delegates again. If delegation is unavailable, disclose that and execute each requested lens serially, preserving separate evidence. Never silently drop a lens. Use numbered choices if the host has no wizard.
