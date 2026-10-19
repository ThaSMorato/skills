---
description: Validate a design document against the one it came from before the human gate (coverage both ways, contradictions, glossary drift, unanswered RNFs) with a clean/dirty verdict.
argument-hint: '<from> <to> (e.g. "prd hld"), or omit to validate every available pair'
---

Load skill `thasmorato-skills:doc-validate` to check: $ARGUMENTS

> Load skill `thasmorato-skills:asking` before you report or ask: resolve every id to what it means, offer a structured choice where the answer is a closed set, and ask only what is genuinely a decision.

With no argument, validate every pair whose two documents exist: `brief → prd`, `prd → hld`, `prd → features`, `hld → components`, `features → fdd`.

Before delegating, confirm both sides of each pair exist: a missing target should fail here, with the name of the command that produces it, not inside the check.

After it returns, show for each pair: the verdict, the open issues most-severe first, and (first, because it is the one nothing else looks for) anything in the **coverage** category, where the source said something and the target dropped it.

If any pair is `dirty`, the fix goes back to the stage that wrote the document: re-run its command, or edit the file directly. Then re-run this. If everything is `clean`, hand back to the gate: the user approves the document and its `Status` becomes `approved`.

## Stage boundary
Deliver this stage's artifact, name the next command as a recommendation to the owner, and stop the turn. Never invoke another stage, repeat this stage, or ask another agent/harness to perform the next stage. A dirty verdict is a report, never an automatic fix/revalidate loop. Only `/tm-flow` may coordinate transitions, each after an explicit owner gate. A subagent does its assigned work itself and never delegates again.

## Harness adapter (generated)
In Claude Code, load a named plugin skill through the Skill tool with its fully qualified `thasmorato-skills:<name>`. Delegate a named subagent through the Agent tool. Never resolve a bare skill name from another plugin. Use AskUserQuestion when available, otherwise numbered options. Relative plugin paths in the source are relative to that source file, not the project cwd.
