---
name: tm-doc-validate
description: Validate a design document against the one it came from before the human gate (coverage both ways, contradictions, glossary drift, unanswered RNFs) with a clean/dirty verdict.
argument-hint: '<from> <to> (e.g. "prd hld"), or omit to validate every available pair'
user-invocable: false
---

Load skill `thasmorato-skills:doc-validate` to check: the owner's supplied arguments

> Load skill `thasmorato-skills:asking` before you report or ask: resolve every id to what it means, offer a structured choice where the answer is a closed set, and ask only what is genuinely a decision.

With no argument, validate every pair whose two documents exist: `brief → prd`, `prd → hld`, `prd → features`, `hld → components`, `features → fdd`.

Before delegating, confirm both sides of each pair exist: a missing target should fail here, with the name of the command that produces it, not inside the check.

After it returns, show for each pair: the verdict, the open issues most-severe first, and (first, because it is the one nothing else looks for) anything in the **coverage** category, where the source said something and the target dropped it.

If any pair is `dirty`, the fix goes back to the stage that wrote the document: re-run its command, or edit the file directly. Then re-run this. If everything is `clean`, hand back to the gate: the user approves the document and its `Status` becomes `approved`.

## Stage boundary
Deliver this stage's artifact, name the next command as a recommendation to the owner, and stop the turn. Never invoke another stage, repeat this stage, or ask another agent/harness to perform the next stage. A dirty verdict is a report, never an automatic fix/revalidate loop. Only `/tm-flow` may coordinate transitions, each after an explicit owner gate. A subagent does its assigned work itself and never delegates again.

## Codex adapter (generated)
Load core skills by opening their SKILL.md from this plugin, stripping `thasmorato-skills:` from the logical name. For delegation use the available spawn tool with the named agent's instructions from `../../agent-specs/<name>.md`; if the client has registered the generated TOML agents, use those. Parallelize independent read-only lenses within the host concurrency limit, queueing remaining lenses. A subagent never delegates again. If delegation is unavailable, disclose that and execute each requested lens serially, preserving separate evidence. Never silently drop a lens. Use numbered choices if the host has no wizard.
