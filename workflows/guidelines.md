---
description: Generate the project's engineering guidelines router, an index of stack guides, documents, conventions and real commands (≤150 lines, lazy-loaded).
argument-hint: "(none): detected from the repo; re-run when the stack changes"
---

Delegate to subagent `guideline-generator` to generate `docs/guias/guidelines.md` for this project.

The output is a **router**: which guide covers which files, where the project's documents are, and what the repo's real commands are. The depth per technology lives in `.claude/skills/<tech>-guide/`; generate those with `/tm-generate-stack-guide <tech>`.

After the agent returns, show: the detected stack, the routing table, which technologies have a guide and which are marked missing, the commands it found, and the final line count. Then offer to run `/tm-generate-stack-guide` for each missing technology.

This is a generate-once document; re-run it when the stack changes, not per feature.

## Stage boundary
Deliver this stage's artifact, name the next command as a recommendation to the owner, and stop the turn. Never invoke another stage, repeat this stage, or ask another agent/harness to perform the next stage. A dirty verdict is a report, never an automatic fix/revalidate loop. Only `/tm-flow` may coordinate transitions, each after an explicit owner gate. A subagent does its assigned work itself and never delegates again.
