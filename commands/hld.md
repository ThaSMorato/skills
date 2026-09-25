---
description: Write the High-Level Design from the PRD (docs/prd.md).
argument-hint: "(optional) path to the PRD, if not docs/prd.md"
---

Use the `hld-writer` agent to synthesize a High-Level Design into `docs/hld.md` from the PRD ($ARGUMENTS, or `docs/prd.md` by default).

If the PRD doesn't exist, tell the user to run `/prd` first instead of delegating.

After the agent returns, show a short summary: the components and main flows, the cross-cutting drivers, any `> Needs Input` markers (these block approval) and every `> Assumed:` marker, grouped, for the user to confirm or correct, and any decisions flagged as ADR candidates. Don't edit the HLD yourself — if changes are needed, re-run the agent with the correction. The one edit you make directly is rewriting a confirmed `> Assumed:` as `> Decided:` (the `asking` skill §5).
