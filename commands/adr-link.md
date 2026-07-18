---
description: Maintain the ADR link graph (supersedes/amends inverses) and refresh the timeline index.
---

Use the `adr-linker` agent to repair the bidirectional link metadata across `docs/adr/*.md` and regenerate `docs/adr/index.md` (timeline + graph).

If `docs/adr/` has no ADRs, tell the user to generate some first with `/adr-generate`.

After the agent returns, show a short summary: inverses repaired, statuses updated to `superseded`, and the index location.
