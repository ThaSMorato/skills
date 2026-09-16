---
description: Generate the project's engineering guidelines router — an index of stack guides, documents, conventions and real commands (≤150 lines, lazy-loaded).
argument-hint: "(none) — detected from the repo; re-run when the stack changes"
---

Use the `guideline-generator` agent to generate `docs/guidelines.md` for this project.

The output is a **router**: which guide covers which files, where the project's documents are, and what the repo's real commands are. The depth per technology lives in `.claude/skills/<tech>-guide/` — generate those with `/generate-stack-guide <tech>`.

After the agent returns, show: the detected stack, the routing table, which technologies have a guide and which are marked missing, the commands it found, and the final line count. Then offer to run `/generate-stack-guide` for each missing technology.

This is a generate-once document — re-run it when the stack changes, not per feature.
