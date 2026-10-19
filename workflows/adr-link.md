---
description: Maintain the ADR link graph (supersedes/amends inverses) and refresh the timeline index.
---

Delegate to subagent `adr-linker` to derive the bidirectional graph without editing `docs/adr/*.md` and regenerate `docs/adr/README.md` (timeline + graph).

If `docs/adr/` has no ADRs, tell the user to generate some first with `/tm-adr-generate`.

After the agent returns, show a short summary: inverse edges and effective statuses derived without changing an ADR, and the index location.

## Stage boundary
Deliver this stage's artifact, name the next command as a recommendation to the owner, and stop the turn. Never invoke another stage, repeat this stage, or ask another agent/harness to perform the next stage. A dirty verdict is a report, never an automatic fix/revalidate loop. Only `/tm-flow` may coordinate transitions, each after an explicit owner gate. A subagent does its assigned work itself and never delegates again.
