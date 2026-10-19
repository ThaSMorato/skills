---
description: Answer one design question with throwaway code (a clickable HTML demo of a state model, or switchable UI variants on the real page), record the answer where the design was waiting for it, and keep the code off the working branch.
argument-hint: "<the question, e.g. can an order be partly cancelled after a shipment left?>"
---

Load skill `thasmorato-skills:prototype` for: $ARGUMENTS

> Load skill `thasmorato-skills:asking` before you report or ask: resolve every id to what it means, offer a structured choice where the answer is a closed set, and ask only what is genuinely a decision.

Preflight: there is one question, and it is a design question (logic or UI). "Build the feature" is not one: point at `/tm-design`. More than one question is more than one prototype; ask which comes first.

Postflight: the question, how to open the prototype (the file or the URL and command), and once answered, the path to the prototype file, where the answer landed as a `Decided` marker, and what happened to the code (throwaway branch or deleted).

## Stage boundary
Deliver this stage's artifact, name the next command as a recommendation to the owner, and stop the turn. Never invoke another stage, repeat this stage, or ask another agent/harness to perform the next stage. A dirty verdict is a report, never an automatic fix/revalidate loop. Only `/tm-flow` may coordinate transitions, each after an explicit owner gate. A subagent does its assigned work itself and never delegates again.

## Harness adapter (generated)
In Claude Code, load a named plugin skill through the Skill tool with its fully qualified `thasmorato-skills:<name>`. Delegate a named subagent through the Agent tool. Never resolve a bare skill name from another plugin. Use AskUserQuestion when available, otherwise numbered options. Relative plugin paths in the source are relative to that source file, not the project cwd.
