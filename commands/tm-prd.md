---
description: Write the PRD from the requirements brief (docs/requirements-brief.md).
argument-hint: "(optional) path to the brief, if not docs/requirements-brief.md"
---

Delegate to subagent `prd-writer` to synthesize a PRD into `docs/produto/prd.md` from the requirements brief ($ARGUMENTS, or `docs/requirements-brief.md` by default).

> Load skill `thasmorato-skills:asking` before you report or ask: resolve every id to what it means, offer a structured choice where the answer is a closed set, and ask only what is genuinely a decision.

If the brief doesn't exist, tell the user to run `/tm-interview` first instead of delegating.

After the agent returns, show a short summary: which sections were filled, which optional sections were pruned, and any `> Needs Input` markers (these block approval) and every `> Assumed:` marker, grouped, for the user to confirm or correct. Don't edit the PRD yourself; if changes are needed, re-run the agent with the correction. The one edit you make directly is rewriting a confirmed `> Assumed:` as `> Decided:` (the `asking` skill §5).

## Stage boundary
Deliver this stage's artifact, name the next command as a recommendation to the owner, and stop the turn. Never invoke another stage, repeat this stage, or ask another agent/harness to perform the next stage. A dirty verdict is a report, never an automatic fix/revalidate loop. Only `/tm-flow` may coordinate transitions, each after an explicit owner gate. A subagent does its assigned work itself and never delegates again.

## Harness adapter (generated)
In Claude Code, load a named plugin skill through the Skill tool with its fully qualified `thasmorato-skills:<name>`. Delegate a named subagent through the Agent tool. Never resolve a bare skill name from another plugin. Use AskUserQuestion when available, otherwise numbered options. Relative plugin paths in the source are relative to that source file, not the project cwd.
