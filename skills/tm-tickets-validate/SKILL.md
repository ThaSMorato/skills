---
name: tm-tickets-validate
description: Validate a feature's ticket set before the human gate (coverage, invention, tickets too big or too small, several tickets on one seam, blocking cycles, dispersion), with a clean/dirty verdict.
argument-hint: "<feature name or slug>"
user-invocable: false
---

Load skill `thasmorato-skills:tickets-validate` to validate the tickets for: the owner's supplied arguments

> Load skill `thasmorato-skills:asking` before you report or ask: resolve every id to what it means, offer a structured choice where the answer is a closed set, and ask only what is genuinely a decision.

`/tm-tickets` runs this on its own as its postflight. Run it directly after editing tickets by hand.

After it returns, show the verdict, the **tickets-to-seams count** first (it is the one number that shows an over-split set at a glance), then the open findings: merges and splits before the rest, each ticket named by number and title.

If `dirty`, the fix belongs to `/tm-tickets`, or to a hand edit of the ticket files. Then re-run this.

## Stage boundary
Deliver this stage's artifact, name the next command as a recommendation to the owner, and stop the turn. Never invoke another stage, repeat this stage, or ask another agent/harness to perform the next stage. A dirty verdict is a report, never an automatic fix/revalidate loop. Only `/tm-flow` may coordinate transitions, each after an explicit owner gate. A subagent does its assigned work itself and never delegates again.

## Codex adapter (generated)
Load core skills by opening their SKILL.md from this plugin, stripping `thasmorato-skills:` from the logical name. For delegation use the available spawn tool with the named agent's instructions from `../../agent-specs/<name>.md`; if the client has registered the generated TOML agents, use those. Parallelize independent read-only lenses within the host concurrency limit, queueing remaining lenses. A subagent never delegates again. If delegation is unavailable, disclose that and execute each requested lens serially, preserving separate evidence. Never silently drop a lens. Use numbered choices if the host has no wizard.
