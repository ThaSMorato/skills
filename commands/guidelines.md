---
description: Generate a self-contained Engineering Guidelines document for the project (once, from its language and stack).
argument-hint: <language> [--orm= --web= --framework= --db= --testing= --logging= --validation= ...]
---

Use the `guideline-generator` agent to generate `docs/guidelines.md` for: $ARGUMENTS

If no language was given, ask for it. Pass any `--param=value` flags through to the agent; it auto-populates the essentials you don't specify.

After the agent returns, show a short summary: the Project Stack (specified vs auto-populated), which optional sections were included or skipped and why, and the final length. This is a generate-once document — re-run only when the stack changes.
