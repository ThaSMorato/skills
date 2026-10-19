---
description: Generate a per-technology engineering guide skill (conventions, idioms, gotchas and security idioms for one language or framework), as a lazy-loaded router.
argument-hint: "<technology> (e.g. ruby, react, nestjs, go)"
---

Load skill `thasmorato-skills:generate-stack-guide` for: $ARGUMENTS

Run all five phases: choose the source, mine it, confirm the calls with the user, generate `.claude/skills/<tech>-guide/`, and register the routing row in `docs/guias/guidelines.md`.

The unit is the **technology**, not the project: a Ruby + React repo gets two guides that compose, and each one is reusable in the next repo that uses that stack.

After it returns, show what was generated, which conventions came from the repo versus the external source, and any place the two disagreed.

## Stage boundary
Deliver this stage's artifact, name the next command as a recommendation to the owner, and stop the turn. Never invoke another stage, repeat this stage, or ask another agent/harness to perform the next stage. A dirty verdict is a report, never an automatic fix/revalidate loop. Only `/tm-flow` may coordinate transitions, each after an explicit owner gate. A subagent does its assigned work itself and never delegates again.
