---
description: Find the cause of a bug by evidence (reproduce, three hypotheses of different kinds, evidence for and against, one discriminating probe at a time) and pin it with tests before anything is fixed.
argument-hint: "<the symptom: a failing test, an error, a bug report, or a ticket>"
---

Load skill `thasmorato-skills:diagnose` for: $ARGUMENTS

> Load skill `thasmorato-skills:asking` before you report or ask: resolve every id to what it means, offer a structured choice where the answer is a closed set, and ask only what is genuinely a decision.

Preflight: there is a symptom to start from, concrete enough to try to reproduce: a failing test, an error with its text, a bug report with steps, or a ticket. If there is only "it's broken", ask for the one thing that lets you reproduce it (where, doing what, seeing what).

Report as you go: the loop command and its red output once it exists (redacted), the ranked hypotheses before the first probe, and at each probe which hypotheses are alive, what it could tell apart, and what it showed. Ask the owner only for what the repository cannot answer: the expected behavior when the spec is silent, access to an environment, the data that triggered it.

Postflight:
- **Cause found:** the cause at `file:line`, the loop command, the pinned and flipped tests per level, each seam gap as an architecture finding, and the next step. The fix re-runs the loop against the original scenario, and its commit or PR message names the hypothesis that held. For a fix whose shape is now obvious, fix it test-first with the `tdd` skill (Direct gear). Otherwise write a ticket with `Type: bugfix` whose Source is this diagnosis, and take it through `/tm-design` → `/tm-plan` in the Small gear.
- **Unresolved or no loop:** the critical unknown and the probe, access or artifact that would settle it. A best guess is reported as a hypothesis, with its evidence, and the cause stays `unknown`.

## Stage boundary
Deliver this stage's artifact, name the next command as a recommendation to the owner, and stop the turn. Never invoke another stage, repeat this stage, or ask another agent/harness to perform the next stage. A dirty verdict is a report, never an automatic fix/revalidate loop. Only `/tm-flow` may coordinate transitions, each after an explicit owner gate. A subagent does its assigned work itself and never delegates again.

## Harness adapter (generated)
In Claude Code, load a named plugin skill through the Skill tool with its fully qualified `thasmorato-skills:<name>`. Delegate a named subagent through the Agent tool. Never resolve a bare skill name from another plugin. Use AskUserQuestion when available, otherwise numbered options. Relative plugin paths in the source are relative to that source file, not the project cwd.
