---
description: Write the High-Level Design from the PRD (docs/produto/prd.md).
argument-hint: "(optional) path to the PRD, if not docs/produto/prd.md"
---

Delegate to subagent `hld-writer` to synthesize a High-Level Design into `docs/arquitetura/hld.md` from the PRD ($ARGUMENTS, or `docs/produto/prd.md` by default).

> Load skill `thasmorato-skills:asking` before you report or ask: resolve every id to what it means, offer a structured choice where the answer is a closed set, and ask only what is genuinely a decision.

If the PRD doesn't exist, tell the user to run `/tm-prd` first instead of delegating.

After the agent returns, show a short summary: the components and main flows, the cross-cutting drivers, any `> Needs Input` markers (these block approval) and every `> Assumed:` marker, grouped, for the user to confirm or correct, and any decisions flagged as ADR candidates. Don't edit the HLD yourself; if changes are needed, re-run the agent with the correction. The one edit you make directly is rewriting a confirmed `> Assumed:` as `> Decided:` (the `asking` skill §5).

## Stage boundary
Deliver this stage's artifact, name the next command as a recommendation to the owner, and stop the turn. Never invoke another stage, repeat this stage, or ask another agent/harness to perform the next stage. A dirty verdict is a report, never an automatic fix/revalidate loop. Only `/tm-flow` may coordinate transitions, each after an explicit owner gate. A subagent does its assigned work itself and never delegates again.
