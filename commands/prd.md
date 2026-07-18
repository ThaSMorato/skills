---
description: Write the PRD from the requirements brief (docs/requirements-brief.md).
argument-hint: (optional) path to the brief, if not docs/requirements-brief.md
---

Use the `prd-writer` agent to synthesize a PRD into `docs/prd.md` from the requirements brief ($ARGUMENTS, or `docs/requirements-brief.md` by default).

If the brief doesn't exist, tell the user to run `/interview` first instead of delegating.

After the agent returns, show a short summary: which sections were filled, which optional sections were pruned, and any `> Needs Input` markers that need the user's attention. Don't edit the PRD yourself — if changes are needed, re-run the agent.
